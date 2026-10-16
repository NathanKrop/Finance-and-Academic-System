export type CbeSettingsRoute = {
  route: string;
  label: string;
};

export const CBE_SETTINGS_ROUTES: readonly CbeSettingsRoute[] = [
  { route: "marks/subject", label: "Marks Entry by Subject" },
  { route: "assign/students", label: "Assign Subjects to Students" },
  { route: "teachers/per-stream", label: "Assign Subjects to Teachers per Stream" },
  { route: "teachers/per-teacher", label: "Assign Subjects to Teachers per Teacher" },
  { route: "pathway-students", label: "Pathway Student List" },
] as const;

export function getCbeSettingsSidebar() {
  return CBE_SETTINGS_ROUTES.map((route) => ({
    label: route.label,
    href: `/academic/cbe-settings/${route.route}`,
  }));
}
