import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "./AppText";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

export default function SelectPickerModal({
  visible = false,
  title = "Select Option",
  options = [],
  selectedValue = "",
  onSelect,
  onClose,
  searchPlaceholder = "Search...",
  loading = false,
  error = null,
  onRetry,
  emptyMessage = "No choices available yet.",
}) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  const handleClose = () => {
    setSearch("");
    onClose();
  };

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((item) => {
      const label = typeof item === "string" ? item : item.label;
      return label.toLowerCase().includes(q);
    });
  }, [options, search]);

  const handleSelect = (item) => {
    const value = typeof item === "string" ? item : item.value;
    onSelect(value);
    setSearch("");
    onClose();
  };

  const styles = getStyles(colors, isDark, insets);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <Pressable style={styles.dismissArea} onPress={handleClose} />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <AppText style={styles.title}>{title}</AppText>
              <Pressable
                onPress={handleClose}
                style={styles.closeBtn}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close picker"
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </Pressable>
            </View>

            {/* Search Input */}
            {options.length > 6 && (
              <View style={styles.searchBar}>
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={colors.textSubtle}
                  style={styles.searchIcon}
                />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={colors.textSubtle}
                  style={styles.searchInput}
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                />
              </View>
            )}
          </View>

          {/* List */}
          {loading ? <View style={styles.emptyWrap}><ActivityIndicator color={colors.primary} /><AppText>Loading choices…</AppText></View> : error ? (
            <View style={styles.emptyWrap}>
              <AppText style={styles.emptyText}>{error}</AppText>
              {!!onRetry && <Pressable onPress={onRetry} style={styles.itemRow} accessibilityRole="button" accessibilityLabel="Retry loading choices"><AppText style={{ color: colors.primary }}>Try again</AppText></Pressable>}
            </View>
          ) : <FlatList
            data={filteredOptions}
            keyExtractor={(item, index) =>
              typeof item === "string" ? `${item}-${index}` : `${item.value}-${index}`
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const label = typeof item === "string" ? item : item.label;
              const value = typeof item === "string" ? item : item.value;
              const isSelected = selectedValue === value;

              return (
                <Pressable
                  style={[styles.itemRow, isSelected && styles.itemRowSelected]}
                  onPress={() => handleSelect(item)}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityState={{ selected: isSelected }}
                >
                  <AppText
                    style={[
                      styles.itemLabel,
                      isSelected && styles.itemLabelSelected,
                    ]}
                  >
                    {label}
                  </AppText>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <AppText style={styles.emptyText}>{search ? "No matches found" : emptyMessage}</AppText>
              </View>
            }
          />}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getStyles = (colors, isDark, insets) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    dismissArea: {
      flex: 1,
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: scale(28),
      borderTopRightRadius: scale(28),
      maxHeight: "80%",
      paddingBottom: Math.max(insets.bottom, scale(16)),
    },
    header: {
      paddingHorizontal: scale(20),
      paddingTop: scale(10),
      paddingBottom: scale(12),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderSoft,
    },
    handle: {
      width: scale(36),
      height: scale(5),
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.18)",
      borderRadius: scale(2.5),
      alignSelf: "center",
      marginBottom: scale(12),
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      fontSize: ms(17),
      fontWeight: "700",
      color: colors.text,
    },
    closeBtn: {
      padding: scale(4),
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surfaceAlt,
      borderRadius: scale(10),
      paddingHorizontal: scale(10),
      marginTop: scale(12),
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    searchIcon: {
      marginRight: scale(6),
    },
    searchInput: {
      flex: 1,
      height: scale(38),
      fontSize: ms(14),
      color: colors.text,
      fontFamily: "Outfit_400Regular",
    },
    listContent: {
      paddingHorizontal: scale(16),
      paddingVertical: scale(8),
    },
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: scale(14),
      paddingHorizontal: scale(12),
      borderRadius: scale(10),
      marginVertical: scale(2),
    },
    itemRowSelected: {
      backgroundColor: colors.accentTint,
    },
    itemLabel: {
      fontSize: ms(15),
      color: colors.text,
      flex: 1,
      paddingRight: scale(8),
    },
    itemLabelSelected: {
      color: colors.primary,
      fontWeight: "700",
    },
    emptyWrap: {
      paddingVertical: scale(30),
      alignItems: "center",
    },
    emptyText: {
      color: colors.textSubtle,
      fontSize: ms(14),
    },
  });
