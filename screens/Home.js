import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import TodoList from "../components/TodoList";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { hideCompletedReducer, setTodosReducer } from "../redux/todosSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import moment from "moment";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldShowAlert: true,
    shouldSetBadge: true,
  }),
});

const Home = () => {
  const todos = useSelector((state) => state.todos.todos);
  const [isHidden, setIsHidden] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [expoPushToken, setExpoPushToken] = useState("");

  const handleHidePress = async () => {
    if (isHidden) {
      setIsHidden(false);
      const todos = await AsyncStorage.getItem("@Todos");
      if (todos !== null) {
        dispatch(setTodosReducer(JSON.parse(todos)));
      }
      return;
    }
    setIsHidden(true);
    dispatch(hideCompletedReducer());
  };

  const registerForPushNotificationAsync = async () => {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("token === ", token);
    } else {
      return;
    }
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
    return token;
  };

  useEffect(() => {
    registerForPushNotificationAsync().then((token) => setExpoPushToken(token));
    const getTodos = async () => {
      try {
        const todos = await AsyncStorage.getItem("@Todos");
        if (todos !== null) {
          const todosData = JSON.parse(todos);

          // console.log("todosData :", todosData);

          const todosDataFiltered = todosData.filter((todo) => {
            return moment(new Date(todo.hour)).isSameOrAfter(moment(), "day");
          });

          if (todosDataFiltered !== null) {
            // console.log("todosFiltersData :", todosDataFiltered);

            await AsyncStorage.setItem(
              "@Todos",
              JSON.stringify(todosDataFiltered)
            );

            console.log("we delete some passed todos");
            dispatch(setTodosReducer(todosDataFiltered));
          }
        }
      } catch (e) {
        console.log(e);
      }
    };
    getTodos();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://reactnative.dev/img/tiny_logo.png",
        }}
        style={styles.pic}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={styles.title}>Today</Text>
        <TouchableOpacity onPress={handleHidePress}>
          <Text style={{ color: "#3478f6" }}>
            {isHidden ? "Show Completed" : "Hide Completed"}
          </Text>
        </TouchableOpacity>
      </View>
      <TodoList
        todosData={todos.filter((todo) =>
          moment(new Date(todo.hour)).isSame(moment(), "day")
        )}
      />
      <Text style={styles.title}>Tomorrow</Text>
      <TodoList
        todosData={todos.filter((todo) =>
          moment(new Date(todo.hour)).isAfter(moment(), "day")
        )}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Add")}
      >
        <Text style={styles.plus}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 70,
  },
  pic: {
    width: 42,
    height: 42,
    alignSelf: "flex-end",
    borderRadius: 21,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 35,
    marginTop: 10,
  },
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#000000",
    position: "absolute",
    bottom: 50,
    right: 15,
    shadowColor: "#0000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  plus: {
    fontSize: 40,
    color: "#ffffff",
    position: "absolute",
    top: Platform.OS === "ios" ? -6 : -12,
    left: 9,
  },
});
