import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function HomeScreen() {
  const [note, setNote] = useState("");
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const STORAGE_KEY = "USER_NOTES";

  // theme-aware colors for inputs/buttons
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor(
    { light: "#999", dark: "#aaa" },
    "text",
  );
  const border = useThemeColor({ light: "#ccc", dark: "#555" }, "background");
  const cardBg = useThemeColor(
    { light: "#f2f2f2", dark: "rgba(255,255,255,0.15)" },
    "background",
  );

  // Load saved note when app starts
  useEffect(() => {
    loadNote();
  }, []);

  const loadNote = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      if (value !== null) {
        const notes = JSON.parse(value);
        setSavedNotes(Array.isArray(notes) ? notes : []);
      }
    } catch (error) {
      Alert.alert("Error loading notes");
    }
    setLoading(false);
  };

  const saveNote = async () => {
    if (!note.trim()) {
      Alert.alert("Please enter a note first.");
      return;
    }

    try {
      const updatedNotes = [...savedNotes, note];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      setSavedNotes(updatedNotes);
      setNote("");
      Alert.alert("Note saved successfully!");
    } catch (error) {
      Alert.alert("Error saving note");
    }
  };

  const clearNote = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setSavedNotes([]);
      Alert.alert("All notes cleared!");
    } catch (error) {
      Alert.alert("Error clearing notes");
    }
  };

  const deleteNote = async (index: number) => {
    try {
      const updatedNotes = savedNotes.filter((_, i) => i !== index);
      if (updatedNotes.length === 0) {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      }
      setSavedNotes(updatedNotes);
    } catch (error) {
      Alert.alert("Error deleting note");
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        📝 MAGPUYO Notes App
      </ThemedText>

      <TextInput
        style={[styles.input, { borderColor: border, color: textColor }]}
        placeholder="Write your note here..."
        placeholderTextColor={placeholderColor}
        value={note}
        onChangeText={setNote}
      />

      <TouchableOpacity
        style={[styles.button, styles.saveButton]}
        onPress={saveNote}
      >
        <ThemedText style={styles.buttonText}>Save Note</ThemedText>
      </TouchableOpacity>

      {savedNotes.length > 0 && (
        <View style={styles.notesContainer}>
          <ThemedText type="subtitle" style={styles.subtitle}>
            Saved Notes ({savedNotes.length}):
          </ThemedText>
          <FlatList
            data={savedNotes}
            keyExtractor={(_, index) => index.toString()}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <View style={[styles.card, { backgroundColor: cardBg }]}>
                <View style={styles.noteHeader}>
                  <ThemedText style={{ flex: 1 }}>{item}</ThemedText>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteNote(index)}
                  >
                    <ThemedText style={styles.deleteButtonText}>×</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      )}

      {savedNotes.length > 0 && (
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearNote}
        >
          <ThemedText style={styles.buttonText}>Clear All Notes</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  notesContainer: {
    marginTop: 20,
    flex: 1,
  },
  card: {
    marginVertical: 8,
    padding: 15,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
  },
  subtitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  deleteButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#d9534f",
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  saveButton: {
    backgroundColor: "#0a7ea4",
  },
  clearButton: {
    backgroundColor: "#d9534f",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
