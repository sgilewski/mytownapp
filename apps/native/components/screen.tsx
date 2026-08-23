import type { PropsWithChildren } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { brand } from "@mytownapp/design";
export function Screen({children}:PropsWithChildren){return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>{children}</ScrollView></SafeAreaView>};
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:brand.colors.cream},content:{padding:20,paddingBottom:42}});
