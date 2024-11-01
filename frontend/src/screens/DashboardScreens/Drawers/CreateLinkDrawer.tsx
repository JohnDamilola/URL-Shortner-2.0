import {
  Button,
  Collapse,
  DatePicker,
  Drawer,
  Input,
  Space,
  Switch,
} from "antd";
import { useCreateLink } from "api/createLink";
import { useState } from "react";
import Swal from "sweetalert2";

const { Panel } = Collapse;

export const CreateLinkDrawer = ({
  openedCreateLink,
  setOpenedCreateLink,
}: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [payload, setPayload] = useState<any>({
    created_on: null,
    disabled: false,
    expire_on: null,
    long_url: null,
    stub: null,
    title: null,
    updated_on: null,
    utm_campaign: null,
    utm_content: null,
    utm_medium: null,
    utm_source: null,
    utm_term: null,
    max_visits: null,
  });
  const createLinkMutation = useCreateLink();

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
    setIsLoading(true);
    createLinkMutation.mutate(payload, {
      onSuccess: () => {
        Swal.fire({
          icon: "success",
          title: "Link Created Successfully!",
          text: "You have successfully created a short link",
          confirmButtonColor: "#221daf",
        }).then(() => {
          window.location.reload();
        });
      },
      onError: () => {
        Swal.fire({
          icon: "error",
          title: "Link Creation Failed!",
          text: "An error occurred, please try again",
          confirmButtonColor: "#221daf",
        });
      },
    });
  };

  return (
    <Drawer
      title="Create Short URL"
      placement="right"
      onClose={() => setOpenedCreateLink(false)}
      open={openedCreateLink}
    >
      <div>
        <form>
          <div className="form-group">
            <label>Title *</label>
            <Input onChange={(e) => handleChange("title", e)} size="large" />
          </div>
          <div className="form-group">
            <label>Long URL *</label>
            <Input onChange={(e) => handleChange("long_url", e)} size="large" />
          </div>
          <div className="form-group">
            <label>Max Visits (optional)</label>
            <Input
              type="number"
              min="1"
              placeholder="Enter maximum number of visits"
              onChange={(e) => handleChange("max_visits", e)}
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
                    onChange={(e) => handleChange("utm_source", e)}
                    size="large"
                  />
                </div>
                <div className="form-group">
                  <label>UTM Medium (optional)</label>
                  <Input
                    onChange={(e) => handleChange("utm_medium", e)}
                    size="large"
                  />
                </div>
                <div className="form-group">
                  <label>UTM Campaign (optional)</label>
                  <Input
                    onChange={(e) => handleChange("utm_campaign", e)}
                    size="large"
                  />
                </div>
                <div className="form-group">
                  <label>UTM Term (optional)</label>
                  <Input
                    onChange={(e) => handleChange("utm_term", e)}
                    size="large"
                  />
                </div>
                <div className="form-group">
                  <label>UTM Content (optional)</label>
                  <Input
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
                    onChange={(e) => handleChange("password_hash", e)}
                    size="large"
                  />
                </div>
                <div className="form-group">
                  <label>Expire on (optional)</label>
                  <DatePicker showTime onChange={handleDateChange} />
                </div>
              </Panel>
            </Collapse>
          </div>
          <div className="form-group">
            <Space>
              <Button
                size={"large"}
                onClick={() => setOpenedCreateLink(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                size={"large"}
                onClick={handleSubmit}
                type="primary"
                disabled={isLoading}
                loading={isLoading}
              >
                Submit
              </Button>
            </Space>
          </div>
        </form>
      </div>
    </Drawer>
  );
};
