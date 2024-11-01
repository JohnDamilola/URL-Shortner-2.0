import { Drawer } from "antd";
import { useFetchLinkEngagements } from "api/fetchLinkEngagements";

export const ViewLinkDrawer = ({ openedLink, setOpenedLink }: any) => {
  const { id } = openedLink || {};
  const { data: linkEngagements, isLoading } = useFetchLinkEngagements(
    id,
    openedLink
  );
  return (
    <Drawer
      title="URL Engagement Analytics"
      placement="right"
      onClose={() => setOpenedLink(null)}
      open={openedLink}
    >
      <div>
        {isLoading ? (
          "fetching link details"
        ) : (
          <div>
            <h3>No of visits: {linkEngagements?.length}</h3>
          </div>
        )}
      </div>
    </Drawer>
  );
};
