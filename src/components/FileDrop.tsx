import React, { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";

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
  const onDrop = useCallback((acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      console.log(file.arrayBuffer());
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    isFocused,
  } = useDropzone({ onDrop });

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
        <p>Drop the Training Tables spreadsheet here.</p>
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
