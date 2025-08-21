import { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import mammoth from "mammoth";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function WordLikeEditor() {
  const [value, setValue] = useState("");

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setValue(result.value);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold", "italic", "underline", "strike",
    "align",
    "list", "bullet",
    "blockquote", "code-block",
    "link", "image",
  ];

  return (
    <div className="w-full h-full p-4">
      <input type="file" accept=".docx" onChange={handleUpload} />

      <ReactQuill
        theme="snow"
        value={value}
        onChange={setValue}
        placeholder="Escreva aqui..."
        className="h-[80vh] mt-4"
        modules={modules}
        formats={formats}
      />
    </div>
  );
}
