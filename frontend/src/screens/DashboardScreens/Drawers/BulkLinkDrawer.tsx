import { Button, Drawer } from "antd";
import { useCreateBulkLinks } from "api/createBulkLinks";
import { useState } from "react";
import Swal from "sweetalert2";

export const BulkCreateLinkDrawer = ({
  openedBulkCreateLink,
  setOpenedBulkCreateLink,
}: any) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [jsonData, setJsonData] = useState<any>(null);
  const createBulkLinksMutation = useCreateBulkLinks();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    if (selectedFile && selectedFile.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const textContent = reader.result as string;
          // Convert TXT content to JSON
          const jsonData = txtToJson(textContent);
          // Send the converted JSON to the backend
          setJsonData(jsonData);
          console.log("Converted JSON Data from TXT:", jsonData);
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Invalid File",
            text: "The file could not be converted to JSON. Please check the format.",
          });
        }
      };
      reader.readAsText(selectedFile);
    } else if (selectedFile && selectedFile.type === "application/json") {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const jsonData = JSON.parse(reader.result as string);
          setJsonData(jsonData);
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Invalid JSON File",
            text: "The file could not be parsed. Please check the format.",
          });
        }
      };
      reader.readAsText(selectedFile);
    } else {
      Swal.fire({
        icon: "error",
        title: "Invalid File Type",
        text: "Please upload a text file.",
      });
    }
  };

  const txtToJson = (text: string) => {
    // Split the text into lines
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    const links = lines.map((line) => {
      // Split each line by comma and trim spaces
      const [long_url, title, stub] = line
        .split(",")
        .map((value) => value.trim());
      if (!long_url || !title) {
        throw new Error("Invalid file format");
      }
      // Create JSON object for each line
      return {
        long_url,
        title,
        stub: "stub",
        // createShortlink() // Use a function to generate stub if missing
      };
    });

    return { links };
  };

  const handleBulkSubmit = async () => {
    if (!jsonData) {
      Swal.fire({
        icon: "error",
        title: "Invalid File",
        text: "Please upload a valid file.",
      });
      return;
    }
    setIsLoading(true);

    try {
      createBulkLinksMutation.mutate(
        { jsonPayload: jsonData },
        {
          onSuccess: () => {
            Swal.fire({
              icon: "success",
              title: "Links Created Successfully!",
              text: "You have successfully created multiple short links",
              confirmButtonColor: "#221daf",
            }).then(() => {
              window.location.reload();
            });
          },
          onError: () => {
            Swal.fire({
              icon: "error",
              title: "Bulk Link Creation Failed!",
              text: "An error occurred, please try again",
              confirmButtonColor: "#221daf",
            });
          },
        }
      );
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Bulk Link Creation Failed!",
        text: "An error occurred, please try again",
        confirmButtonColor: "#221daf",
      });
    } finally {
      setIsLoading(false);
      setOpenedBulkCreateLink(false);
    }
  };

  return (
    <Drawer
      title="Bulk Create Short URLs"
      placement="right"
      onClose={() => setOpenedBulkCreateLink(false)}
      open={openedBulkCreateLink}
    >
      <div>
        <p>
          <strong>Allowed File Types:</strong> JSON or TXT
        </p>
        <p>
          <strong>JSON Format:</strong>
        </p>
        <pre>{`{
      "links": [
          {
              "long_url": "https://anotherexample2.com",
              "title": "Example 1"
          },
          ...
      ]
  }`}</pre>

        <p>
          <strong>TXT Format:</strong>
        </p>
        <pre style={{ padding: 1 }}>{`https://exampl111e.com,Example Title 111
  https://anotherexample11111111.com,Another1 Example
  https://yetanotherexample11111.com,Yet Another1111 Example`}</pre>

        <input type="file" onChange={handleFileChange} accept=".json,.txt" />

        <Button
          size={"large"}
          onClick={handleBulkSubmit}
          type="primary"
          disabled={isLoading}
          loading={isLoading}
        >
          Submit
        </Button>
      </div>
    </Drawer>
  );
};
