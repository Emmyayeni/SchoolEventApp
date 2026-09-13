import { supabase } from "../../lib/supabase";

export const DEFAULT_ACADEMIC_DATA = {
  faculties: [
    {
      name: "Faculty of Natural and Applied Sciences",
      departments: [
        "Computer Science",
        "Mathematics",
        "Physics",
        "Chemistry",
        "Microbiology",
        "Biochemistry",
        "Zoology",
        "Botany",
        "Geology",
      ],
    },
    {
      name: "Faculty of Social Sciences",
      departments: [
        "Economics",
        "Mass Communication",
        "Political Science",
        "Sociology",
        "Psychology",
      ],
    },
    {
      name: "Faculty of Arts",
      departments: [
        "English",
        "History and International Studies",
        "Theatre Arts",
        "Languages and Linguistics",
        "Religious Studies",
        "Philosophy",
      ],
    },
    {
      name: "Faculty of Administration",
      departments: [
        "Business Administration",
        "Accounting",
        "Public Administration",
        "Banking and Finance",
      ],
    },
    {
      name: "Faculty of Law",
      departments: [
        "Commercial Law",
        "Public Law",
        "Private Law",
      ],
    },
    {
      name: "Faculty of Education",
      departments: [
        "Educational Foundations",
        "Science Education",
        "Arts Education",
        "Guidance and Counselling",
      ],
    },
    {
      name: "Faculty of Agriculture",
      departments: [
        "Agronomy",
        "Animal Science",
        "Agricultural Economics and Extension",
        "Home Science and Management",
      ],
    },
    {
      name: "Faculty of Environmental Science",
      departments: [
        "Architecture",
        "Urban and Regional Planning",
        "Geography",
        "Estate Management",
      ],
    },
  ],
  levels: ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "Postgraduate"],
};

/**
 * Fetch faculties dynamically from Supabase database, falling back to NSUK academic structure.
 */
export async function fetchAcademicFaculties() {
  try {
    const { data, error } = await supabase
      .from("academic_faculties")
      .select("name, id")
      .order("name", { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((f) => f.name);
    }
  } catch (_e) {
    // Graceful fallback to default NSUK faculties
  }

  return DEFAULT_ACADEMIC_DATA.faculties.map((f) => f.name);
}

/**
 * Fetch departments, optionally filtered by a specific faculty.
 */
export async function fetchAcademicDepartments(selectedFaculty = "") {
  try {
    let query = supabase.from("academic_departments").select("name, faculty_name");
    if (selectedFaculty) {
      query = query.eq("faculty_name", selectedFaculty);
    }
    const { data, error } = await query.order("name", { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((d) => d.name);
    }
  } catch (_e) {
    // Fallback
  }

  if (selectedFaculty) {
    const found = DEFAULT_ACADEMIC_DATA.faculties.find(
      (f) => f.name.toLowerCase() === selectedFaculty.toLowerCase()
    );
    if (found) {
      return found.departments;
    }
  }

  // If no faculty specified, return all departments flattened
  return DEFAULT_ACADEMIC_DATA.faculties.flatMap((f) => f.departments).sort();
}

/**
 * Fetch student levels (e.g., 100 Level, 200 Level, etc.)
 */
export async function fetchAcademicLevels() {
  return DEFAULT_ACADEMIC_DATA.levels;
}
