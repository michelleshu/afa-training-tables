import React, { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { read } from "xlsx";
import SpreadsheetRow from "../types/SpreadsheetRow";
import { parseSpreadsheet } from "../util/spreadsheetParser";

const baseStyle = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#e0e0e0",
  borderStyle: "solid",
  backgroundColor: "#fafafa",
  color: "#9e9e9e",
  outline: "none",
  cursor: "pointer",
  transition: "border .3s ease-in-out",
};

const focusedStyle = {
  borderColor: "#9e9e9e",
};

const acceptStyle = {
  borderColor: "#2196f3",
};

const rejectStyle = {
  borderColor: "#f44336",
};

function FileDrop() {
  const [spreadsheetRows, setSpreadsheetRows] = useState<SpreadsheetRow[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const fileBuffer = await file.arrayBuffer();
    const workbook = read(fileBuffer);
    setSpreadsheetRows(parseSpreadsheet(workbook));
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    isFocused,
  } = useDropzone({
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    multiple: false,
    onDrop,
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  return (
    <div {...getRootProps({ style })}>
      <input {...getInputProps()} />
      {isDragActive ? (
        isDragAccept ? (
          <p>Drop the Training Tables spreadsheet here.</p>
        ) : (
          <p>Please choose an .xls or .xlsx file.</p>
        )
      ) : (
        <p>
          Drag and drop the Training Tables spreadsheet here, or click to select
          the file.
        </p>
      )}
    </div>
  );
}

export default FileDrop;
