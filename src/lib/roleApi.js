/**
 * The partner panel serves two kinds of signed-in people with different APIs:
 *   Project Partner : /project-partner/...  (owns properties, team and enquiries)
 *   Sales Partner   : /sales/...            (works the enquiries assigned to them, read-only on properties)
 * These helpers pick the right base path for a role.
 */
export const SALES_ROLE = "Sales Partner";
export const isSalesRole = (role) => role === SALES_ROLE;

export function enquiryPaths(role) {
  const sales = isSalesRole(role);
  return {
    isSales: sales,
    enquirers: sales ? "/sales/enquirers" : "/project-partner/enquirers",
    enquiry: sales ? "/sales/enquiry" : "/project-partner/enquiry",
  };
}

export function propertyPaths(role) {
  const sales = isSalesRole(role);
  return {
    isSales: sales,
    list: sales ? "/sales/properties/" : "/project-partner/properties/",
    one: (id) => (sales ? `/sales/properties/${id}` : `/project-partner/properties/${id}`),
  };
}
