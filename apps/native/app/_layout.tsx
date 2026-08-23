import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { CalendarDays, Heart, Home, UserRound } from "lucide-react-native";
import { brand } from "@mytownapp/design";
import { AuthProvider } from "@/providers/auth-provider";
import { FeedProvider } from "@/providers/feed-provider";
export default function RootLayout(){return <AuthProvider><FeedProvider><Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:brand.colors.green,tabBarInactiveTintColor:brand.colors.muted,tabBarStyle:styles.tabBar,tabBarLabelStyle:styles.tabBarLabel}}><Tabs.Screen name="index" options={{title:"Home",tabBarIcon:({color})=><Home color={color} size={22}/>}}/><Tabs.Screen name="events" options={{title:"Events",tabBarIcon:({color})=><CalendarDays color={color} size={22}/>}}/><Tabs.Screen name="saved" options={{title:"Saved",tabBarIcon:({color})=><Heart color={color} size={22}/>}}/><Tabs.Screen name="account" options={{title:"Account",tabBarIcon:({color})=><UserRound color={color} size={22}/>}}/></Tabs></FeedProvider></AuthProvider>}
const styles=StyleSheet.create({tabBar:{height:84,paddingTop:9,borderTopColor:brand.colors.line},tabBarLabel:{fontSize:11,fontWeight:"700",paddingBottom:9}});
