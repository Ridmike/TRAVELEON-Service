import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { SimpleLineIcons, Octicons, MaterialCommunityIcons } from '@expo/vector-icons';

type IconSectionProps = {
  onSectionPress: (section: string) => void; 
};

const IconSection: React.FC<IconSectionProps> = ({ onSectionPress }) => {
  const [activeSection, setActiveSection] = useState<string>('Popular Post');
  const circleTranslateX = useRef(new Animated.Value(width / 2)).current; 
  
  // References to measure positions
  const yourPostsRef = useRef<View>(null);
  const popularPostRef = useRef<View>(null);
  const chatListRef = useRef<View>(null);

  // Add animation values for each tab
  const [animations] = useState({
    yourPosts: {
      scale: new Animated.Value(1),
      translateY: new Animated.Value(0)
    },
    popularPost: {
      scale: new Animated.Value(1),
      translateY: new Animated.Value(0)
    },
    chatList: {
      scale: new Animated.Value(1),
      translateY: new Animated.Value(0)
    }
  });

  // Function to animate the circle to a specific position
  const animateCircleTo = (xPosition: number) => {
    Animated.spring(circleTranslateX, {
      toValue: xPosition,
      useNativeDriver: true,
      friction: 7,
      tension: 40
    }).start();
  };

  // Add animation function
  const animateTab = (tabName: 'yourPosts' | 'popularPost' | 'chatList', isActive: boolean) => {
    Animated.parallel([
      Animated.spring(animations[tabName].scale, {
        toValue: isActive ? 1.1 : 1,
        useNativeDriver: true,
        friction: 5
      }),
      Animated.timing(animations[tabName].translateY, {
        toValue: isActive ? -20 : 0,
        duration: 200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true
      })
    ]).start();
  };

  const handleSectionPress = (section: string) => {
    // Reset all animations
    Object.keys(animations).forEach(key => {
          animateTab(key as 'yourPosts' | 'popularPost' | 'chatList', false);
        });

    // Animate the selected tab
    switch(section) {
      case 'You Posts':
        animateTab('yourPosts', true);
        yourPostsRef.current?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
          animateCircleTo(pageX + width / 2);
        });
        break;
      case 'Popular Post':
        animateTab('popularPost', true);
        popularPostRef.current?.measure((x, y, width, height, pageX, pageY) => {
          animateCircleTo(pageX + width / 2);
        });
        break;
      case 'Chat List':
        animateTab('chatList', true);
        chatListRef.current?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
          animateCircleTo(pageX + width / 2);
        });
        break;
    }

    setActiveSection(section);
    onSectionPress(section);
  };

  // Set initial position when component mounts
  useEffect(() => {
    // Delay to ensure components are rendered and measurements are accurate
    const timer = setTimeout(() => {
      if (activeSection === 'Popular Post') {
        popularPostRef.current?.measure((x, y, width, height, pageX, pageY) => {
          circleTranslateX.setValue(pageX + width / 2);
        });
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.circleIndicator,
          {
            transform: [{ translateX: circleTranslateX }]
          }
        ]} 
      />
      
      {/* Your Posts Tab */}
      <View ref={yourPostsRef} style={styles.tabItem}>
        <Animated.View style={[
          styles.tab,
          {
            transform: [
              { scale: animations.yourPosts.scale },
              { translateY: animations.yourPosts.translateY }
            ]
          }
        ]}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeSection === 'You Posts' && styles.activeTab
            ]}
            onPress={() => handleSectionPress('You Posts')}
            activeOpacity={0.7}
          >
            <Octicons 
              name="home" 
              size={24} 
              color={activeSection === 'You Posts' ? '#FFFFFF' : '#AAAAAA'} 
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      {/* Popular Post Tab */}
      <View ref={popularPostRef} style={styles.tabItem}>
        <Animated.View style={[
          styles.tab,
          {
            transform: [
              { scale: animations.popularPost.scale },
              { translateY: animations.popularPost.translateY }
            ]
          }
        ]}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeSection === 'Popular Post' && styles.activeTab
            ]}
            onPress={() => handleSectionPress('Popular Post')}
            activeOpacity={0.7}
          >
            <SimpleLineIcons 
              name="fire" 
              size={24} 
              color={activeSection === 'Popular Post' ? '#FFFFFF' : '#AAAAAA'} 
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      {/* Chat List Tab */}
      <View ref={chatListRef} style={styles.tabItem}>
        <Animated.View style={[
          styles.tab,
          {
            transform: [
              { scale: animations.chatList.scale },
              { translateY: animations.chatList.translateY }
            ]
          }
        ]}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeSection === 'Chat List' && styles.activeTab
            ]}
            onPress={() => handleSectionPress('Chat List')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="chat-outline"
              size={32}
              color={activeSection === 'Chat List' ? '#FFFFFF' : '#AAAAAA'}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

export default IconSection;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 90,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999, 
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    height: 90,
    overflow: 'visible',
    position: 'relative', 
    zIndex: 1, 
  },
  circleIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#29B6F6',
    position: 'absolute',
    bottom: 10,
    marginLeft: -5, 
    zIndex: 5,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#29B6F6',
    shadowColor: '#29B6F6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  }
});