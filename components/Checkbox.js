import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Entypo } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { updateTodoReducer } from "../redux/todosSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Checkbox = ({ id, text, isCompleted, isToday, hour }) => {
  const dispatch = useDispatch();
  const listTodos = useSelector((state) => state.todos.todos);

  const handleCheckBox = () => {
    try {
      dispatch(updateTodoReducer({ id, isCompleted }));
      AsyncStorage.setItem(
        "@Todos",
        JSON.stringify(
          listTodos.map((todo) => {
            if (todo.id === id) {
              return { ...todo, isCompleted: !todo.isCompleted };
            }
            return todo;
          })
        )
      );
      console.log("todo saved Correctly...!");
    } catch (e) {
      console.log(e);
    }
  };

  return isToday ? (
    <TouchableOpacity
      style={isCompleted ? styles.checked : styles.unChecked}
      onPress={handleCheckBox}
    >
      {isCompleted && <Entypo name="check" size={16} color="#AFAFAF" />}
    </TouchableOpacity>
  ) : (
    <View style={styles.isToday}></View>
  );
};

export default Checkbox;

const styles = StyleSheet.create({
  checked: {
    width: 20,
    height: 20,
    marginRight: 13,
    borderRadius: 6,
    backgroundColor: "#262626",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 15,
    shadowColor: "#0000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  unChecked: {
    width: 20,
    height: 20,
    marginRight: 13,
    borderWidth: 2,
    borderRadius: 6,
    borderColor: "#E8E8E8",
    backgroundColor: "#ffffff",
    marginLeft: 15,
    shadowColor: "#0000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  isToday: {
    width: 10,
    height: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#262626",
    marginRight: 13,
    marginLeft: 15,
  },
});
