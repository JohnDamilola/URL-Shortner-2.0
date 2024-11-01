import Swal from "sweetalert2";
import { Collapse, Popconfirm } from "antd";
import { useState } from "react";
import http from "utils/api";
import moment from "moment";
import { QuestionCircleOutlined } from "@ant-design/icons";
import "./styles.scss";
import toast, { Toaster } from "react-hot-toast";
import QRCode from "qrcode.react";
import { useFetchStats } from "api/fetchStats";
import { useFetchLinks } from "api/fetchLinks";
import { ViewLinkDrawer } from "./Drawers/ViewLinkDrawer";
import { CreateLinkDrawer } from "./Drawers/CreateLinkDrawer";
import { UpdateLinkDrawer } from "./Drawers/UpdateLinkDrawer";
import { BulkCreateLinkDrawer } from "./Drawers/BulkLinkDrawer";

export var isDisabled: boolean;
export var isExpired: any;

const Dashboard = () => {
  const { data: statData } = useFetchStats();
  const {
    data: linkData,
    isLoading: linkDataLoading,
    error: linkDataError,
  } = useFetchLinks();
  const [openedLink, setOpenedLink] = useState<any | null>(null);
  const [openedViewLink, setOpenedViewLink] = useState<any | null>(null);
  const [openedCreateLink, setOpenedCreateLink] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statsData, setStatsData] = useState<any>(statData);
  const [openedBulkCreateLink, setOpenedBulkCreateLink] =
    useState<boolean>(false);

  const URLshortenerUser = window.localStorage.getItem("URLshortenerUser");
  let user_id = (URLshortenerUser && JSON.parse(URLshortenerUser).id) || {};
  let first_name =
    (URLshortenerUser && JSON.parse(URLshortenerUser).first_name) || {};

  const { total_count, total_disabled, total_enabled, total_engagements } =
    statsData || {};

  const stats = [
    {
      title: "Total Links",
      value: total_count || 0,
      icon: <i className="fa-solid fa-lines-leaning"></i>,
    },
    {
      title: "Enabled Links",
      value: total_enabled || 0,
      icon: <i className="fa-solid fa-link"></i>,
    },
    {
      title: "Disabled Links",
      value: total_disabled || 0,
      icon: <i className="fa-solid fa-link-slash"></i>,
    },
    {
      title: "Link Visits",
      value: total_engagements || 0,
      icon: <i className="fa-solid fa-eye"></i>,
    },
  ];

  return (
    <div className="dashboard-page dashboard-commons">
      <section>
        <Toaster />
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="d-flex justify-content-between items-center">
                <div className="welcome-pane">
                  <h3>
                    <b>Hey {first_name || ""}, Welcome Back!</b> 👋
                  </h3>
                  <p className="">Here's your stats as of today</p>
                </div>
                <div>
                  <button
                    className="btn btn-main"
                    onClick={() => setOpenedCreateLink(true)}
                    style={{ margin: 4 }}
                  >
                    Shorten Link
                  </button>
                  <button
                    className="btn btn-main"
                    onClick={() => setOpenedBulkCreateLink(true)}
                    style={{ margin: 4 }}
                  >
                    Bulk Shorten Links
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {stats.map(({ title, value, icon }, index) => {
              return (
                <div className="col-md-3">
                  <div className="stats-card" key={index}>
                    <p className="text-sm text-white mb-4 font-semibold flex items-center gap-2">
                      {title}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="d-flex gap-2 flex-row align-items-center">
                        {icon}
                        <h3>{value}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="row table-pane">
            {linkDataLoading
              ? "loading links"
              : linkDataError
              ? "An error occurred while fetching links"
              : linkData?.length === 0
              ? "No links created yet"
              : linkData
                  ?.sort((a: any, b: any) =>
                    moment(b.created_on).diff(moment(a.created_on))
                  )
                  .map((item: any, index: number) => (
                    <div key={index} className="col-md-12">
                      <LinkCardItem
                        setOpenedLink={setOpenedLink}
                        setOpenedViewLink={setOpenedViewLink}
                        item={item}
                      />
                    </div>
                  ))}
          </div>
        </div>
      </section>
      <ViewLinkDrawer
        openedLink={openedViewLink}
        setOpenedLink={setOpenedViewLink}
      />
      <UpdateLinkDrawer openedLink={openedLink} setOpenedLink={setOpenedLink} />
      <CreateLinkDrawer
        openedCreateLink={openedCreateLink}
        setOpenedCreateLink={setOpenedCreateLink}
      />
      <BulkCreateLinkDrawer
        openedBulkCreateLink={openedBulkCreateLink}
        setOpenedBulkCreateLink={setOpenedBulkCreateLink}
      />
    </div>
  );
};

export default Dashboard;

const LinkCardItem = ({ setOpenedLink, setOpenedViewLink, item }: any) => {
  const {
    id,
    title,
    stub,
    long_url,
    created_on,
    disabled,
    max_visits = Infinity,
    visit_count = 0,
  } = item || {};

  const [isDeleting, setIsDeleting] = useState(false);

  const URLshortenerUser = window.localStorage.getItem("URLshortenerUser");
  let user_id = (URLshortenerUser && JSON.parse(URLshortenerUser).id) || {};

  const handleCopy = async () => {
    const text = `http://localhost:5001/${stub}`;
    if ("clipboard" in navigator) {
      await navigator.clipboard.writeText(text);
    } else {
      document.execCommand("copy", true, text);
    }
    toast("URL copied successfully!", {
      icon: "👏",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  };

  //   const downloadQRCode = () => {
  //     // Generate download with use canvas and stream
  //     const canvas = document.getElementById("qr-gen") as HTMLCanvasElement;;
  //     if (canvas) {
  //       const pngUrl = canvas
  //         .toDataURL("image/png")
  //         .replace("image/png", "image/octet-stream");
  //       let downloadLink = document.createElement("a");
  //       downloadLink.href = pngUrl;
  //       downloadLink.download = `qrcode.png`;
  //       document.body.appendChild(downloadLink);
  //       downloadLink.click();
  //       document.body.removeChild(downloadLink);
  //     }
  //   };

  const handleDisableEnableLink = async (e: any) => {
    e.preventDefault();
    const payload = {
      // ...item,
      long_url,
      disabled: !disabled,
    };

    await http
      .patch(
        `http://localhost:5002/links/update/${id}?user_id=${user_id}`,
        payload
      )
      .then((res) => {
        const { id } = res.data;
        Swal.fire({
          icon: "success",
          title: `Link ${disabled ? "Enabled" : "Disabled"} Successfully!`,
          text: "You have successfully updated this link",
          confirmButtonColor: "#221daf",
        }).then(() => {
          window.location.reload();
        });
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: `Link ${disabled ? "Enabling" : "Disabling"} Failed!`,
          text: "An error occurred, please try again",
          confirmButtonColor: "#221daf",
        });
      });
  };

  const handleDeleteLink = async (e: any) => {
    e.preventDefault();
    // const payload = {
    // 	// ...item,
    // 	long_url,
    // 	disabled: !disabled,
    // };

    setIsDeleting(true);
    await http
      .delete(`http://localhost:5002/links/delete/${id}?user_id=${user_id}`)
      .then((res) => {
        Swal.fire({
          icon: "success",
          title: `Link Deleted Successfully!`,
          text: "You have successfully deleted this link",
          confirmButtonColor: "#221daf",
        }).then(() => {
          setIsDeleting(false);
          window.location.reload();
        });
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: `Link Deletion Failed!`,
          text: "An error occurred, please try again",
          confirmButtonColor: "#221daf",
        });
        setIsDeleting(false);
      });
  };
  const isExpired = visit_count >= max_visits;
  return (
    <div className="link-card">
      <div className="d-flex justify-content-between">
        <div className="col-lg-10">
          <h5>{title}</h5>
        </div>
        <div className="col-lg-2">
          <p className="time-text">
            <i className="fa-solid fa-clock"></i> {moment(created_on).fromNow()}
          </p>
        </div>
      </div>
      <div className="url-pane">
        <a
          href={`http://localhost:5002/${stub}`}
          rel="noreferrer"
          target="_blank"
        >
          <p>http://localhost:5002/{stub}</p>
        </a>
        <i
          onClick={handleCopy}
          style={{ cursor: "pointer" }}
          className="fa-solid fa-copy"
        ></i>
      </div>
      <p style={{ overflowWrap: "break-word" }}>
        <b>Original URL:</b> {long_url}
      </p>
      <div className="btn-pane">
        {isExpired ? (
          <p style={{ color: "red" }}>
            <b>This link has expired due to reaching maximum visits.</b>
          </p>
        ) : (
          <>
            <button
              className="btn btn-outline-dark"
              onClick={() => setOpenedViewLink(item)}
            >
              <i className="fa-solid fa-eye"></i> View Engagements Analytics
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() => setOpenedLink(item)}
            >
              <i className="fa-solid fa-pen-to-square"></i> Edit
            </button>
          </>
        )}

        <Popconfirm
          title="Are you sure?"
          icon={<QuestionCircleOutlined style={{ color: "red" }} />}
          onConfirm={handleDeleteLink}
        >
          <button className="btn btn-outline-danger">
            <i className="fa-solid fa-trash"></i>{" "}
            {isDeleting ? "Deleting" : "Delete"}
          </button>
        </Popconfirm>
      </div>
      {/* <button className='btn btn-outline-dark'  onClick={downloadQRCode}>
          <i className="fa-solid fa-download"></i>
          Download QR Code
        </button> */}

      <div style={{ display: "none" }}>
        <QRCode
          id="qr-gen"
          value={long_url}
          size={290}
          level={"H"}
          includeMargin={true}
        />
      </div>
    </div>
  );
};
