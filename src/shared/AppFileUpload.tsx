import { useState } from "react";
import { fileUploadProp } from "../helpers/interface/interfaces";

const AppFileUpload: React.FC<fileUploadProp> = ({
  onFileSelect,
  className,
  title,
  btnTitle,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles(files);
    if (files) {
      onFileSelect(files);
    }
  };
  return (
    <div className="">
      <p className="mb-2">{title}</p>
      <label htmlFor="file" className={`${className}`}>
        {btnTitle}
      </label>
      <input
        id="file"
        type="file"
        onChange={handleFileChange}
        className="hidden"
        multiple
      />
      {selectedFiles.length > 0 && (
        <ul>
          {selectedFiles.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AppFileUpload;
