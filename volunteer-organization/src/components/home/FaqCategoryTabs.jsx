import Tabs from "../ui/Tabs";
import { FAQ_CATEGORY_ALL } from "../../hooks/useFaqFilter";

/**
 * @param {Array<{id: string, label: string, icon?: Function}>} categories
 * @param {string} activeCategory
 * @param {(categoryId: string) => void} onChange
 */
export default function FaqCategoryTabs({
  categories,
  activeCategory,
  onChange,
}) {
  const tabs = [
    { id: FAQ_CATEGORY_ALL, label: "All" },
    ...categories,
  ];

  return (
    <Tabs
      tabs={tabs}
      activeTab={activeCategory}
      onChange={onChange}
      ariaLabel="FAQ category filter"
    />
  );
}
