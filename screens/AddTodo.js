import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Button,
  Switch,
} from "react-native";
import React, { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import Moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { addTodoReducer } from "../redux/todosSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";

const AddTodo = () => {
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [isToday, setIsToday] = useState(false);
  const [withAlert, setWithAlert] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const listTodos = useSelector((state) => state.todos.todos);

  const [displayMode, setMode] = useState("time");
  const [isDisplayDate, setShow] = useState(false);

  const addTodo = async () => {
    // console.log("milisecond :" , new Date(86400025))
    var currentDate = new Date(date)
    // console.log("tomorrow  : ",new Date(currentDate.setDate(currentDate.getDate()+1)))

    
    // console.log("current date = ",new Date(currentDate.setDate(currentDate.getDate()+1)))

    const newTodo = {
      id: Math.floor(Math.random() * 1000000),
      text: name,
      hour: isToday
        ? date.toISOString()
        : new Date(currentDate.setDate(currentDate.getDate()+1)), //new Date(date).getDate() + 24 * 60 * 60 * 1000,
      isToday: isToday,
      isCompleted: false,
    };
    try {
      await AsyncStorage.setItem(
        "@Todos",
        JSON.stringify([...listTodos, newTodo])
      )
      console.log("newTodos : ",newTodo)
      dispatch(addTodoReducer(newTodo));
      console.log("Todo saved correctly...!");
      if (withAlert) {
        await scheduleTodoNotification(newTodo);
      }
      navigation.goBack();
    } catch (e) {
      console.log(e);
    }
  };

  const scheduleTodoNotification = async (todo) => {
    const trigger = new Date(todo.hour);
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "It's time!",
          body: todo.text,
        },
        trigger,
      });
      console.log("notification was schedule..!");
    } catch (e) {
      // console.log(e);
      alert("The notification failed to schedule, make sure the hour is valid");
    }
  };

  const changeSelectedDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setShow(false);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const displayTimepicker = () => {
    showMode("time");
  };

  const datepickerForAndroid = () => {
    return (
      <View>
        <TouchableOpacity
          style={{ backgroundColor: "#E8E8E8", padding: 5, borderRadius: 6 }}
          onPress={displayTimepicker}
        >
          <Text style={{ fontSize: 20 }}>{Moment(date).format("h:mm A")}</Text>
        </TouchableOpacity>
        {isDisplayDate && (
          <DateTimePicker
            value={date}
            mode={displayMode}
            is24Hour={false}
            display="default"
            onChange={changeSelectedDate}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Task</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputTitle}>Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Task"
          placeholderTextColor="#00000030"
          onChangeText={(text) => setName(text)}
          value={name}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputTitle}>Hour</Text>
        {Platform.OS === "android" ? (
          datepickerForAndroid()
        ) : (
          <DateTimePicker
            value={date}
            mode={"time"}
            is24Hour={true}
            display="default"
            onChange={changeSelectedDate}
            style={{ width: "80%" }}
          />
        )}
      </View>
      <View>
        <View style={[styles.inputContainer, { alignItems: "center" }]}>
          <View>
            <Text style={styles.inputTitle}>Today</Text>
            <Text style={{ color: "#00000040", fontSize: 12, maxWidth: "85%" }}>
              If you disable today, the task will be considered as tomorrow.
            </Text>
          </View>
          <Switch
            value={isToday}
            onValueChange={(value) => setIsToday(value)}
          />
        </View>
      </View>
      <View style={[styles.inputContainer, { alignItems: "center" }]}>
        <View>
          <Text style={styles.inputTitle}>Alert</Text>
          <Text style={{ color: "#00000040", fontSize: 12, maxWidth: "85%" }}>
            You will receive an alert at the time you set for this reminder.
          </Text>
        </View>

        <Switch
          value={withAlert}
          onValueChange={(value) => setWithAlert(value)}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={addTodo}>
        <Text style={{ color: "#ffffff" }}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddTodo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 35,
    marginTop: 10,
  },
  inputTitle: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 24,
  },
  textInput: {
    borderBottomColor: "#000000030",
    borderBottomWidth: 1,
    width: "80%",
  },
  inputContainer: {
    justifyContent: "space-between",
    flexDirection: "row",
    paddingBottom: 30,
  },
  button: {
    marginTop: 30,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
    height: 40,
    borderRadius: 11,
  },
});
