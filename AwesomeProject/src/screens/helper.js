// Screens/helpers.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getFavorites = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('favorites');
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Error getting favorites: ", e);
        return [];
    }
};

export const saveFavorites = async (favorites) => {
    try {
        const jsonValue = JSON.stringify(favorites);
        await AsyncStorage.setItem('favorites', jsonValue);
    } catch (e) {
        console.error("Error saving favorites: ", e);
    }
};

export const toggleFavorite = async (meal) => {
    const favorites = await getFavorites();
    const index = favorites.findIndex(item => item.idMeal === meal.idMeal);
    if (index > -1) {
        // Remove from favorites
        favorites.splice(index, 1);
    } else {
        // Add to favorites
        favorites.push(meal);
    }
    await saveFavorites(favorites);
    return favorites;
};
