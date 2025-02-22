import React, { useEffect, useState, useLayoutEffect } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth } from "firebase/auth";
import { useRoute, useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";

const SellerChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const route = useRoute();
  const navigation = useNavigation();
  const { chatRoomId, buyerName } = route.params as { chatRoomId: string, buyerName: string };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Chat with ${buyerName}`,
    });
  }, [navigation, buyerName]);

  useEffect(() => {
    const q = query(
      collection(db, "chatRooms", chatRoomId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(loadedMessages);
    });

    return unsubscribe;
  }, [chatRoomId]);

  const getUserName = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "usersForign", uid));
      if (userDoc.exists()) {
        return userDoc.data()?.name || "Unknown User";
      }
      return "Unknown User";
    } catch (error) {
      console.error("Error fetching user name:", error);
      return "Unknown User";
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    const senderName = await getUserName(currentUser.uid);

    const messageData = {
      text: newMessage,
      senderId: currentUser.uid,
      senderName: senderName,
      createdAt: new Date().toISOString(),
    };

    await addDoc(collection(db, "chatRooms", chatRoomId, "messages"), messageData);

    setNewMessage("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.messageOuter}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSentByCurrentUser = item.senderId === getAuth().currentUser?.uid;
            return (
              <View
                style={[
                  styles.messageContainer,
                  isSentByCurrentUser ? styles.sentMessage : styles.receivedMessage,
                ]}
              >
                <Text style={styles.messageText}>{item.text}</Text>
                <Text style={styles.timeText}>
                  {moment(item.createdAt).format("h:mm a")}
                </Text>
              </View>
            );
          }}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline={true}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>SEND</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SellerChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  messageOuter: {
    flex: 1,
    padding: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ccc",
    padding: 6,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 10,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  sendButton: {
    backgroundColor: "#007BFF",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  messageContainer: {
    borderRadius: 10,
    padding: 10,
    marginVertical: 4,
    maxWidth: "75%",
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    color: "#333",
    paddingBottom: 4,
  },
  timeText: {
    fontSize: 10,
    color: "#888",
    alignSelf: "flex-end",
  },
});
