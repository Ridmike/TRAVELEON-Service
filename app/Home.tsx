import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, TouchableWithoutFeedback, Alert, StatusBar } from 'react-native';
import { Appbar } from 'react-native-paper'; 
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import TabBar from '../components/TabBar';
import Card from '../components/Card';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, getDoc, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import ChatRoomListScreen from '../components/ChatRoomList';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface UserAd {
  id: string;
  collectionName: string;
  [key: string]: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>("Popular Post");
  const [userName, setUserName] = useState<string | null>(null);
  const [userAds, setUserAds] = useState<UserAd[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const colors = {
    primary: '#24BAEC',      
    secondary: '#78D1F1',     
    accent: '#0A96C7',       
    textPrimary: '#333333',   
    textSecondary: '#666666', 
    white: '#FFFFFF',         
    black: '#000000',         
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthenticated(true);
        try {
          const userDoc = await getDoc(doc(db, "usersLocal", user.uid));
          setUserName(userDoc.exists() ? userDoc.data().name || "User" : "User");
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserName("User");
        }
      } else {
        setAuthenticated(false);
        setUserName(null);
      }
    });
    return unsubscribe;
  }, []);

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const handleSectionPress = (section: string) => {
    setSelectedSection(section);
  };

  const fetchUserAds = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to view your posts.");
      setLoading(false);
      return;
    }

    try {
      const collections = [
        "accommodations",
        "restaurants",
        "vehicleRentals",
        "tourGuides",
        "adventures",
      ];

      const allAds: UserAd[] = [];

      await Promise.all(
        collections.map(async (collectionName) => {
          const collectionRef = collection(db, collectionName);
          const q = query(collectionRef, where("uid", "==", currentUser.uid));
          const querySnapshot = await getDocs(q);

          const ads = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            collectionName,
            ...doc.data(),
          }));

          allAds.push(...ads);
        })
      );
      
      setUserAds(allAds);
    } catch (error) {
      console.error("Error fetching user ads:", error);
      Alert.alert("Error", "Could not fetch your posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSection === 'You Posts') {
      fetchUserAds();
    }
  }, [selectedSection]);

  const renderAdCard = (ad: UserAd) => {
    switch (ad.collectionName) {
      case 'accommodations':
        return (
          <View key={ad.id} style={styles(colors).modernCard}>
            <View style={styles(colors).cardHeader}>
              <View>
                <Text style={styles(colors).modernTitle}>{ad.name}</Text>
                <View style={styles(colors).locationContainer}>
                  <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles(colors).locationText}>{ad.location}</Text>
                </View>
              </View>
              <View style={styles(colors).tagContainer}>
                <Text style={styles(colors).modernTag}>Accommodation</Text>
              </View>
            </View>
            
            <View style={styles(colors).cardDivider} />
            
            <View style={styles(colors).detailsContainer}>
              <View style={styles(colors).detailItem}>
                <Ionicons name="home-outline" size={20} color={colors.primary} />
                <Text style={styles(colors).detailText}>{ad.accommodationType}</Text>
              </View>
              <View style={styles(colors).detailItem}>
                <Ionicons name="cash-outline" size={20} color={colors.primary} />
                <Text style={styles(colors).detailText}>Rs {ad.pricePerNight}/night</Text>
              </View>
            </View>
          </View>
        );
      case 'restaurants':
        return (
          <View key={ad.id} style={styles(colors).modernCard}>
            <View style={styles(colors).cardHeader}>
              <View>
                <Text style={styles(colors).modernTitle}>{ad.name}</Text>
                <View style={styles(colors).locationContainer}>
                  <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles(colors).locationText}>{ad.location}</Text>
                </View>
              </View>
              <View style={styles(colors).tagContainer}>
                <Text style={styles(colors).modernTag}>Restaurant</Text>
              </View>
            </View>
            
            <View style={styles(colors).cardDivider} />
            
            <View style={styles(colors).detailsContainer}>
              <View style={styles(colors).detailItem}>
                <Ionicons name="restaurant-outline" size={20} color={colors.primary} />
                <Text style={styles(colors).detailText}>{ad.cuisine}</Text>
              </View>
              <View style={styles(colors).detailItem}>
                <Ionicons name="cash-outline" size={20} color={colors.primary} />
                <Text style={styles(colors).detailText}>{ad.priceRange}</Text>
              </View>
            </View>
          </View>
        );
      case 'vehicleRentals':
        return (
          <View key={ad.id} style={styles(colors).modernCard}>
            <View style={styles(colors).cardHeader}>
              <View>
                <Text style={styles(colors).modernTitle}>{ad.name}</Text>
                <View style={styles(colors).locationContainer}>
                  <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles(colors).locationText}>{ad.location}</Text>
                </View>
              </View>
              <View style={styles(colors).tagContainer}>
                <Text style={styles(colors).modernTag}>Vehicle</Text>
              </View>
            </View>
            
            <View style={styles(colors).cardDivider} />
            
            <View style={styles(colors).detailsContainer}>
              <View style={styles(colors).detailItem}>
                <Ionicons name="car-outline" size={20} color={colors.primary} />
                <Text style={styles(colors).detailText}>{ad.vehicleType}</Text>
              </View>
              <View style={styles(colors).detailItem}>
                <Ionicons name="cash-outline" size={20} color={colors.primary} />
                <Text style={styles(colors).detailText}>Rs {ad.pricePerDay}/day</Text>
              </View>
            </View>
          </View>
        );
      case 'tourGuides':
        return (
          <View key={ad.id} style={styles(colors).modernCard}>
            <View style={styles(colors).cardHeader}>
              <View>
                <Text style={styles(colors).modernTitle}>{ad.name}</Text>
                <View style={styles(colors).locationContainer}>
                  <Ionicons name="globe-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles(colors).locationText}>{ad.languages}</Text>
                </View>
              </View>
              <View style={styles(colors).tagContainer}>
                <Text style={styles(colors).modernTag}>Tour Guide</Text>
              </View>
            </View>
            
            <View style={styles(colors).cardDivider} />
            
            <View style={styles(colors).detailsContainer}>
              <View style={styles(colors).detailItem}>
                <Ionicons name="person-outline" size={20} color={colors.primary} />
                <Text style={styles(colors).detailText}>Professional Guide</Text>
              </View>
              <View style={styles(colors).detailItem}>
                <Ionicons name="cash-outline" size={20} color={colors.primary} />
                <Text style={styles(colors).detailText}>Rs {ad.pricePerDay}/day</Text>
              </View>
            </View>
          </View>
        );
        case 'adventures':
        return (
          <View key={ad.id} style={styles(colors).modernCard}>
            <View style={styles(colors).cardHeader}>
              <View>
                <Text style={styles(colors).modernTitle}>{ad.name}</Text>
                <View style={styles(colors).locationContainer}>
                  <Ionicons name="compass-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles(colors).locationText}>{ad.adventureType}</Text>
                </View>
              </View>
              <View style={styles(colors).tagContainer}>
                <Text style={styles(colors).modernTag}>Adventure</Text>
              </View>
            </View>
            
            <View style={styles(colors).cardDivider} />
            
            <View style={styles(colors).detailsContainer}>
              <View style={styles(colors).detailItem}>
                <Ionicons name="flag-outline" size={20} color={colors.primary} />
                <Text style={styles(colors).detailText}>{ad.adventureType}</Text>
              </View>
              <View style={styles(colors).detailItem}>
                <Ionicons name="cash-outline" size={20} color={colors.primary} />
                <Text style={styles(colors).detailText}>Rs {ad.pricePerPerson}/person</Text>
              </View>
            </View>
          </View>
        );
      default:
        return (
          <View key={ad.id} style={styles(colors).modernCard}>
            <View style={styles(colors).cardHeader}>
              <View>
                <Text style={styles(colors).modernTitle}>{ad.title || ad.name}</Text>
              </View>
              <View style={styles(colors).tagContainer}>
                <Text style={styles(colors).modernTag}>{ad.collectionName}</Text>
              </View>
            </View>
          </View>
        );
    }
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'Popular Post':
        return (
          <View style={styles(colors).contentContainer}>
            <Card title="Getting Started with Facebook Marketing" description="Learn how to create engaging content and grow your audience on Facebook." />
            <Card title="Effective Strategies" description="Discover strategies to maximize your marketing ROI." />
            <Card title="Case Studies" description="Explore how brands use Facebook for impactful campaigns." />
          </View>
        );
      case 'Chat List':
        return (
          <View style={styles(colors).contentContainer}>
            <ChatRoomListScreen disableVirtualization={true} />
          </View>
        );
      case 'You Posts':
        return (
          <View>
            {!isAuthenticated ? (
              <TouchableOpacity onPress={() => navigation.navigate('Login')}
              >
              <Text style={styles(colors).authPrompt}>Please log in to post an ad.</Text>
              </TouchableOpacity>
            ) : loading ? (
              <Text style={styles(colors).loadingText}>Loading your posts...</Text>
            ) : userAds.length === 0 ? (
              <View style={styles(colors).emptyPostsContainer}>
                <Ionicons name="document-outline" size={48} color={colors.primary} style={styles(colors).emptyIcon} />
                <Text style={styles(colors).noPostsText}>No posts found.</Text>
                <Text style={styles(colors).noPostsSubtext}>Tap the "Post Ad" button to create your first listing!</Text>
              </View>
            ) : (
              userAds.map((ad) => renderAdCard(ad))
            )}
          </View>
        );
      default:
        return <Text style={styles(colors).placeholder}>Select a section to view content</Text>;
    }
  };

  return (
    <View style={styles(colors).container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <Appbar.Header style={{ backgroundColor: colors.primary }}>
        <View style={{ flex: 1, justifyContent: 'center'}}>
          <Text 
        style={{ 
          color: colors.white, 
          fontSize: 24, 
          textAlign: 'left', 
          paddingLeft: 16, 
          fontWeight: 'bold',
        }}
          >
        Travelone
          </Text>
        </View>
        <Appbar.Action
          icon="account-circle"
          color={colors.white}
          onPress={() => {
            if (isAuthenticated) {
              navigation.navigate('Profile');
            } else {
              navigation.navigate('Login');
            }
          }}
        />
      </Appbar.Header>

      <View style={styles(colors).contentWrapper}>
        {/* Fixed Headers Section - Only show if not in Chat List */}
        {selectedSection !== 'Chat List' && (
          <View style={styles(colors).fixedHeadersContainer}>
            {/* Modern Welcome Header with Card-like Design */}
            <View style={styles(colors).welcomeHeader}>
              <View style={styles(colors).welcomeTextContainer}>
                <Text style={styles(colors).greetingText}>Hello,</Text>
                <Text style={styles(colors).nameText}>{userName || "Guest"}</Text>
              </View>
              <View style={styles(colors).actionButtonContainer}>
                {isAuthenticated && (
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('AdPost')} 
                    style={styles(colors).floatingActionButton}
                  >
                    <Ionicons name="add" size={24} color={colors.white} />
                    <Text style={styles(colors).fabText}>Post Ad</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            {/* Exploration Prompt with Subtle Card Effect */}
            <View style={styles(colors).explorationPrompt}>
              <View style={styles(colors).promptContent}>
                <View style={styles(colors).promptIconContainer}>
                  <Ionicons name="megaphone-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles(colors).promptTextContainer}>
                  <Text style={styles(colors).promptTitle}>Ready to showcase?</Text>
                  <Text style={styles(colors).promptSubtext}>
                    Share your services with thousands of potential customers
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Rest of the content */}
        <ScrollView
          contentContainerStyle={styles(colors).scrollContainer}
          showsVerticalScrollIndicator={false}
          style={styles(colors).scrollView}
        >
          <View style={styles(colors).bodySecOuter}>
            {/* Content Area */}
            <View style={styles(colors).contentArea}>
              {renderContent()}
            </View>
            <View style={styles(colors).bottomPadding}></View>
          </View>
        </ScrollView>

        {/* Tab Bar Container */}
        <View style={styles(colors).tabBarContainer}>
          <TabBar onSectionPress={handleSectionPress} />
        </View>
      </View>
    </View>
  );
};

const styles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    right: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    width: 150,
    zIndex: 999,
    borderWidth: 1,
    borderColor: '#eee',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownText: {
    fontSize: 16,
    marginLeft: 10,
    color: colors.textPrimary,
  },
  scrollContainer: {
    // paddingTop: 16,
  },
  bodySecOuter: {
    paddingHorizontal: 14,
  },
  welcomeContainer: {
    marginVertical: 20,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  greetingText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  nameText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.black,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  contentContainer: {
    marginTop: 20,
  },
  adCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  adText: {
    color: colors.textPrimary,
    marginBottom: 4,
    fontSize: 15,
  },
  collectionTag: {
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: colors.primary,
    color: colors.white,
    borderRadius: 20,
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: 'bold',
  },
  adButton: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    height: 50,
    width: '70%',
    marginHorizontal: '15%',
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  authPrompt: {
    fontSize: 16,
    color: colors.primary,
    marginVertical: 16,
    textAlign: 'center',
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: colors.textSecondary,
  },
  noPostsText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: colors.textSecondary,
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  placeholder: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 30,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bottomPadding: {
    height: 100, 
  },
  emptyPostsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    padding: 30,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.7,
  },
 
  noPostsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  
  actionButtonContainer: {
    alignItems: 'flex-end',
  },
  floatingActionButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabText: {
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  },
  explorationPrompt: {
    backgroundColor: colors.primary + '08', // Light blue with 8% opacity
    borderRadius: 16,
    marginBottom: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary + '15',
  },
  promptContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promptIconContainer: {
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    padding: 10,
    marginRight: 14,
  },
  promptTextContainer: {
    flex: 1,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  promptSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  contentArea: {
    marginTop: 8,
  },
  fixedHeadersContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    zIndex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modernCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modernTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  tagContainer: {
    backgroundColor: colors.primary + '15', // 15% opacity
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  modernTag: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '08', // 8% opacity
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  promptIcon: {
    marginRight: 10,
  },
});

export default HomeScreen;