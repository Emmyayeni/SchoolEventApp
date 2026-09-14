import { supabase } from "../../lib/supabase";

export async function fetchAcademicFaculties() {
  const { data, error } = await supabase.from("academic_faculties").select("name").order("name");
  if (error) throw error;
  return (data || []).map(row => row.name);
}

export async function fetchAcademicDepartments(faculty = "") {
  if (!faculty) return [];
  const { data, error } = await supabase.from("academic_departments").select("name")
    .eq("faculty_name", faculty).order("name");
  if (error) throw error;
  return (data || []).map(row => row.name);
}

export async function fetchAcademicLevels() {
  const { data, error } = await supabase.from("academic_levels").select("name").order("sort_order");
  if (error) throw error;
  return (data || []).map(row => row.name);
}

export async function fetchEventCategories() {
  const { data, error } = await supabase.from("event_categories").select("name").order("name");
  if (error) throw error;
  return (data || []).map(row => row.name);
}

export async function fetchEventVenues() {
  const { data, error } = await supabase.from("events").select("venue").order("venue");
  if (error) throw error;
  return [...new Set((data || []).map(row => row.venue?.trim()).filter(Boolean))];
}
