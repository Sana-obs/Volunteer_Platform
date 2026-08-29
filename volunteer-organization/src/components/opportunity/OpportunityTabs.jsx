
import Tabs from "../ui/Tabs";
import { OPPORTUNITY_TAB_DEFS } from "../../constants/opportunityTabs";

export default function OpportunityTabs({ activeTab, onChange, className = "" }) {
  return (
    <Tabs
      tabs={OPPORTUNITY_TAB_DEFS}
      activeTab={activeTab}
      onChange={onChange}
      ariaLabel="Opportunities view"
      className={className}
    />
  )
}
