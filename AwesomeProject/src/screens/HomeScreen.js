import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Image,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from "react-native-heroicons/outline";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import axios from "axios";
import { StatusBar } from "expo-status-bar";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import Recipes from "../components/Recipes";
import Categories from "../components/Categories";



export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState("Beef");
  const [categories, setCategories] = useState([]);
  const [meals, setMeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAllMeals(); // Tüm yemekleri çek
  }, []);

  useEffect(() => {
    getCategories();
    getRecipes();
  }, []);

  const handleChangeCategory = (category) => {
    getRecipes(category);
    setActiveCategory(category);
    setMeals([]);
    setSearchQuery('');
  };

  const getCategories = async () => {
    try {
      const response = await axios.get(
        "https://www.themealdb.com/api/json/v1/1/categories.php"
      );
      if (response && response.data) {
        setCategories(response.data.categories);
        console.log(response.data.categories);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const getRecipes = async (category = "Beef", query = "") => {
    try {
      let url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
      const response = await axios.get(url);
      if (response && response.data && response.data.meals) {
        // İstemci tarafında yemek adına göre filtreleme
        const filteredMeals = query
          ? response.data.meals.filter(meal => meal.strMeal.toLowerCase().includes(query.toLowerCase()))
          : response.data.meals;
        setMeals(filteredMeals);
        console.log("Filtered meals: ", filteredMeals);
      } else {
        setMeals([]);
      }
    } catch (error) {
      console.log("Error fetching recipes: ", error.message);
    }
  };

  const fetchAllMeals = async (query = "") => {
    try {
      const categoryResponse = await axios.get('https://www.themealdb.com/api/json/v1/1/categories.php');
      const categories = categoryResponse.data.categories;
  
      const mealsRequests = categories.map(category => 
        axios.get(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category.strCategory}`)
      );
      const mealsResponses = await Promise.all(mealsRequests);
      let allMeals = mealsResponses.flatMap(response => response.data.meals || []);
  
      // İstemci tarafında yemek adına göre filtreleme
      if (query) {
        allMeals = allMeals.filter(meal => 
          meal.strMeal.toLowerCase().includes(query.toLowerCase())
        );
      }
      setMeals(allMeals);
    } catch (error) {
      console.error("Error fetching all meals: ", error.message);
      setMeals([]);
    }
  };
  

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <SafeAreaView>
        <ScrollView showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 50,
          }}
          className="space-y-6 pt-14"
        >

          {/* Avatar and Bell Icon */}
          <View className="mx-4 flex-row justify-between items-center">
            <AdjustmentsHorizontalIcon size={hp(4)} color={"gray"} />
            <Image
              source={require("../../assets/avatar.png")}
              style={{
                width: hp(5),
                height: hp(5),
                resizeMode: "cover",
              }}
              className="rounded-full"
            />
          </View>

          {/* Headlines */}
          <View className="mx-4 space-y-1 mb-2">
            <View>
              <Text
                style={{
                  fontSize: hp(3.5),
                }}
                className="font-bold text-neutral-800"
              >
                Fast & Delicious
              </Text>
            </View>

            <Text
              style={{
                fontSize: hp(3.5),
              }}
              className="font-extrabold text-neutral-800"
            >
              Food You <Text className="text-[#f64e32]">Love</Text>
            </Text>
          </View>

          {/* Search Bar */}
          <View className="mx-4 flex-row items-center border rounded-xl border-black p-[6px]">
            <View className="bg-white rounded-full p-2">
              <MagnifyingGlassIcon
                size={hp(2.5)}
                color={"gray"}
                strokeWidth={3}
              />
            </View>
            <TextInput
              placeholder="Search Your Favorite Food"
              placeholderTextColor={"gray"}
              style={{
                fontSize: hp(1.7),
              }}
              className="flex-1 text-base mb-1 pl-1 tracking-widest"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (!text) {
                  getRecipes(activeCategory); // Eğer arama kutusu boşsa, tüm yemekleri getir.
                }
              }}
              onSubmitEditing={() => fetchAllMeals(searchQuery.trim().toLowerCase())}
              

            />
          </View>

          {/* Categories */}
          <View>
            {categories.length > 0 && (
              <Categories
                categories={categories}
                activeCategory={activeCategory}
                handleChangeCategory={handleChangeCategory}
              />
            )}
          </View>

          {/* Recipes Meal */}
          <View>
            <Recipes meals={meals} categories={categories} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}