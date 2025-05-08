import React, { useEffect, useState, useLayoutEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, SafeAreaView, StatusBar } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, getDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "SellerChatScreen">;

interface ChatRoom {
  id: string;
  buyerName: string;
  buyerId: string;
  lastMessage?: string;
  timestamp?: number;
  read?: boolean;
  avatar?: string | null;
  status?: string;
}

interface ChatRoomListProps {
  disableVirtualization?: boolean;
}

const ChatRoomListScreen: React.FC<ChatRoomListProps> = ({ disableVirtualization = false }) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const navigation = useNavigation<NavigationProp>();
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "chatRooms"),
      where("sellerId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const loadedChatRooms = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const buyerId = data.buyerId;
          let buyerName = "Unknown Buyer";
          let avatar = null;
          let status = 'offline';
          let lastMessage = "Start chatting";
          let timestamp = 0;
          let read = data.read !== undefined ? data.read : true;

          if (buyerId) {
            const buyerDoc = await getDoc(doc(db, "usersForign", buyerId));
            if (buyerDoc.exists()) {
              const buyerData = buyerDoc.data();
              buyerName = buyerData.name;
              avatar = buyerData.avatar;
              status = buyerData.status || 'offline';
            }
          }

          try {
            const messagesRef = collection(db, "chatRooms", docSnap.id, "messages");
            const messagesSnapshot = await getDocs(messagesRef);
            messagesSnapshot.forEach((msgDoc) => {
              const msgData = msgDoc.data();
              const msgTime = msgData.createdAt ? new Date(msgData.createdAt).getTime() : 0;
              if (msgTime > timestamp) {
                lastMessage = msgData.text || "";
                timestamp = msgTime;
              }
            });
          } catch (e) {
            console.error("Error fetching messages for chatRoom:", docSnap.id, e);
          }

          return {
            id: docSnap.id,
            buyerName,
            buyerId,
            avatar,
            status,
            lastMessage,
            timestamp,
            read
          };
        })
      );

      loadedChatRooms.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setChatRooms(loadedChatRooms);
    });

    return unsubscribe;
  }, [currentUser]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'online': return '#4CAF50';
      case 'typing': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const formatTime = (timestamp: number | undefined) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString();
  };

  // Render a chat room item
  const renderChatRoomItem = (item: ChatRoom) => {
    return (
      <View style={styles.chatOuter} key={item.id}>
        <TouchableOpacity
          style={styles.chatRoomItem}
          onPress={() => navigation.navigate("SellerChatScreen", {
            chatRoomId: item.id,
            buyerName: item.buyerName
          })}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {item.avatar ? (
                <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarPlaceholder}>
                  {(item.buyerName?.[0] || "?").toUpperCase()}
                </Text>
              )}
            </View>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.topRow}>
              <Text style={styles.buyerName} numberOfLines={1}>
                {item.buyerName}
              </Text>
              <Text style={styles.timestamp}>
                {formatTime(item.timestamp)}
              </Text>
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.status === 'typing' ? 'Typing...' : item.lastMessage || "Start chatting"}
              </Text>
              {!item.read && <View style={styles.unreadIndicator} />}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Content for not logged in users
  const renderNotLoggedInContent = () => (
    <Text style={styles.notLoggedInText}>Please log in to see your chat rooms.</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {!currentUser ? (
        renderNotLoggedInContent()
      ) : disableVirtualization ? (
        // Non-virtualized version for when inside a ScrollView
        <View style={styles.flatScrollContainer}>
          {chatRooms.map(item => renderChatRoomItem(item))}
        </View>
      ) : (
        // Normal FlatList version
        <FlatList
          data={chatRooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderChatRoomItem(item)}
          contentContainerStyle={styles.flatListContent}
        />
      )}
    </SafeAreaView>
  );
};

export default ChatRoomListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    height: '100%',
  },
  flatScrollContainer: {
    paddingBottom: 20,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  chatOuter: {
    flexDirection: 'column',
    paddingVertical: 10,
  },
  notLoggedInText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
  chatRoomItem: {
    flexDirection: 'row',
    padding: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E8E8E8',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E1F5FE',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#29B6F6',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  buyerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#29B6F6',
    marginLeft: 8,
  },
});