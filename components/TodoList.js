import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import Todo from "./Todo";

const TodoList = ({todosData}) => {
  return (
    <FlatList
      data={todosData}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Todo {...item}/>}
    />
  );
};

export default TodoList;

const styles = StyleSheet.create({});
