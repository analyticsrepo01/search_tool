import Facets from "./Facets";
import Filters from "./Filters";
import Configurations from "./Configurations";

const Sidebar = ({
  facetsData,
  setFacetsData,
  isSearchReset,
  
  pageSize,
  setPageSize,
  summaryCount,
  setSummaryCount,
  numSnippets,
  setNumSnippets,
  numAnswers,
  setNumAnswers,
  numSegments,
  setNumSegments,
  tenant,
  setTenant,
  onFacetsChange,
  tenantList
}) => {

  return (
    <div>
      <Facets
        facetsData={facetsData}
        onFacetsChange={onFacetsChange}
        isSearchReset={isSearchReset}
      />
      <Filters
        tenant={tenant}
        setTenant={setTenant}
        tenantList={tenantList}
      />
      <Configurations
        pageSize={pageSize}
        setPageSize={setPageSize}
        summaryCount={summaryCount}
        setSummaryCount={setSummaryCount}
        numSnippets={numSnippets}
        setNumSnippets={setNumSnippets}
        numAnswers={numAnswers}
        setNumAnswers={setNumAnswers}
        numSegments={numSegments}
        setNumSegments={setNumSegments}
        tenant={tenant}
        setTenant={setTenant}
        tenantList={tenantList}
      />
    </div>
  );
};

export default Sidebar;