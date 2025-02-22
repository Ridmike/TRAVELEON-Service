import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import moment from "moment";


type NavigationProp = NativeStackNavigationProp<RootStackParamList, "SellerChatScreen">;

const ChatRoomListScreen: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const navigation = useNavigation<NavigationProp>();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "chatRooms"),
      where("sellerId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedChatRooms = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChatRooms(loadedChatRooms);
    });

    return unsubscribe;
  }, [currentUser]);

  const navigateToChat = (chatRoomId: string, buyerName: string) => {
    navigation.navigate("SellerChatScreen", {
      chatRoomId,
      buyerName,
    });
  };

  useEffect(() => {
    const fetchLatestMessages = async () => {
      const updatedChatRooms = await Promise.all(
        chatRooms.map(async (room) => {
          const messageQuery = query(
            collection(db, "chatRooms", room.id, "messages"),
            orderBy("createdAt", "desc"),
            limit(1)
          );

          return new Promise<any>((resolve) => {
            onSnapshot(messageQuery, (snapshot) => {
              if (!snapshot.empty) {
                const latestMessage = snapshot.docs[0].data();
                const receivedTime = latestMessage.createdAt
                  ? moment(latestMessage.createdAt).format("hh:mm A")
                  : "No messages yet";
                resolve({ ...room, receivedTime });
              } else {
                resolve({ ...room, receivedTime: "No messages yet" });
              }
            });
          });
        })
      );
      setChatRooms(updatedChatRooms);
    };

    if (chatRooms.length > 0) {
      fetchLatestMessages();
    }
  }, [chatRooms]);

  return (
    <View style={styles.container}>
      <FlatList
        data={chatRooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatRoomItem}
            onPress={() => navigateToChat(item.id, item.buyerName)}
          >
            <Text style={styles.chatRoomName}>Chat with {item.buyerName}</Text>
            <Text>{item.receivedTime}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ChatRoomListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  chatRoomItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  chatRoomName: {
    fontSize: 16,
    color: "#333",
  },
});
