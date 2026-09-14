import { formatEventDate } from "./eventTime";

export const filterByCategory = (events, selectedCategory) => {
  if (selectedCategory === "All") {
    return events;
  }

  return events.filter((event) => event.category === selectedCategory);
};

export const searchEvents = (events, keyword) => {
  const value = keyword.trim().toLowerCase();

  if (!value) {
    return events;
  }

  return events.filter((event) => {
    return [event.title, event.category, event.organizer, event.venue]
      .join(" ")
      .toLowerCase()
      .includes(value);
  });
};

export const formatDateLabel = (dateString) => {
  return formatEventDate(dateString, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};
