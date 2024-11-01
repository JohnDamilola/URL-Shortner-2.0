import { useState } from "react";
import {
  Button,
  Collapse,
  DatePicker,
  Drawer,
  Input,
  Space,
  Switch,
} from "antd";
import Swal from "sweetalert2";
import moment from "moment";
import { useUpdateLink } from "api/updateLink";

const { Panel } = Collapse;

export const UpdateLinkDrawer = ({ openedLink, setOpenedLink }: any) => {
  const { id } = openedLink || {};
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [payload, setPayload] = useState<any>(openedLink);
  const updateLinkMutation = useUpdateLink();

  const handleChange = (propertyName: string, e: any) => {
    const _payload = { ...payload };
    _payload[propertyName] = e.target.value;
    setPayload(_payload);
  };

  const handleDateChange = (value: any, dateString: any) => {
    const _payload = { ...payload };
    _payload["expire_on"] = value;
    setPayload(_payload);
  };

  const handleSwitchChange = (checked: boolean) => {
    const _payload = { ...payload };
    _payload["disabled"] = !checked;
    setPayload(_payload);
  };

  const handleSubmit = async () => {
    setIsUpdating(true);
    if (payload.stub === openedLink.stub) {
      delete payload.stub;
    }
    updateLinkMutation.mutate(
      { id, payload },
      {
        onSuccess: () => {
          Swal.fire({
            icon: "success",
            title: "Link Updated Successfully!",
            text: "You have successfully updated this short link",
            confirmButtonColor: "#221daf",
          }).then(() => {
            window.location.reload();
          });
          setIsUpdating(false);
        },
        onError: () => {
          Swal.fire({
            icon: "error",
            title: "Link Update Failed!",
            text: "An error occurred, please try again",
            confirmButtonColor: "#221daf",
          });
          setIsUpdating(false);
        },
      }
    );
  };

  return (
    <Drawer
      title="Update Short URL"
      placement="right"
      onClose={() => setOpenedLink(null)}
      open={openedLink}
    >
      <div>
        {isLoading ? (
          "fetching link details"
        ) : (
          <form>
            <div className="form-group">
              <label>Title *</label>
              <Input
                value={payload?.title}
                onChange={(e) => handleChange("title", e)}
                size="large"
              />
            </div>
            <div className="form-group">
              <label>Long URL *</label>
              <Input
                value={payload?.long_url}
                onChange={(e) => handleChange("long_url", e)}
                size="large"
              />
            </div>
            <div className="form-group">
              <label>Custom end-link (optional)</label>
              <Input
                value={payload?.stub}
                onChange={(e) => handleChange("stub", e)}
                size="large"
              />
            </div>
            <div className="form-group">
              <span style={{ marginRight: "10px" }}>Enabled?</span>
              <Switch defaultChecked onChange={handleSwitchChange} />
            </div>
            <div className="form-group">
              <Collapse defaultActiveKey={["1"]} onChange={() => null}>
                <Panel header="UTM Parameters For Tracking (optional)" key="1">
                  <div className="form-group">
                    <label>UTM Source (optional)</label>
                    <Input
                      value={payload?.utm_source}
                      onChange={(e) => handleChange("utm_source", e)}
                      size="large"
                    />
                  </div>
                  <div className="form-group">
                    <label>UTM Medium (optional)</label>
                    <Input
                      value={payload?.utm_medium}
                      onChange={(e) => handleChange("utm_medium", e)}
                      size="large"
                    />
                  </div>
                  <div className="form-group">
                    <label>UTM Campaign (optional)</label>
                    <Input
                      value={payload?.utm_campaign}
                      onChange={(e) => handleChange("utm_campaign", e)}
                      size="large"
                    />
                  </div>
                  <div className="form-group">
                    <label>UTM Term (optional)</label>
                    <Input
                      value={payload?.utm_term}
                      onChange={(e) => handleChange("utm_term", e)}
                      size="large"
                    />
                  </div>
                  <div className="form-group">
                    <label>UTM Content (optional)</label>
                    <Input
                      value={payload?.utm_content}
                      name="utm_content"
                      onChange={(e) => handleChange("utm_content", e)}
                      size="large"
                    />
                  </div>
                </Panel>
                <Panel header="Short Link Availability" key="2">
                  <div className="form-group">
                    <label>Password (optional)</label>
                    <Input
                      value={payload?.password_hash}
                      onChange={(e) => handleChange("password_hash", e)}
                      size="large"
                    />
                  </div>
                  <div className="form-group">
                    <label>Expire on (optional)</label>
                    <DatePicker
                      value={
                        payload?.expire_on ? moment(payload.expire_on) : null
                      }
                      showTime
                      onChange={handleDateChange}
                    />
                  </div>
                </Panel>
              </Collapse>
            </div>
            <div className="form-group">
              <Space>
                <Button
                  size={"large"}
                  onClick={() => setOpenedLink(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  size={"large"}
                  onClick={handleSubmit}
                  type="primary"
                  disabled={isUpdating}
                  loading={isUpdating}
                >
                  Update
                </Button>
              </Space>
            </div>
          </form>
        )}
      </div>
    </Drawer>
  );
};
