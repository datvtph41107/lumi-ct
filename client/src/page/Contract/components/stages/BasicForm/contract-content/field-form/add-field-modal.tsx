// "use client";

// import type React from "react";
// import { useState, useEffect } from "react";
// import { X, Plus, Trash2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import type { FieldConfig } from "./contract-content-renderer";

// interface AddFieldModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     onSave: (field: FieldConfig) => void;
//     editingField: FieldConfig | null;
//     selectedColumn: 1 | 2 | 3;
// }

// export const AddFieldModal: React.FC<AddFieldModalProps> = ({ isOpen, onClose, onSave, editingField, selectedColumn }) => {
//     const [formData, setFormData] = useState<Partial<FieldConfig>>({
//         name: "",
//         label: "",
//         type: "text",
//         placeholder: "",
//         required: false,
//         options: [],
//         column: selectedColumn,
//     });

//     useEffect(() => {
//         if (editingField) {
//             setFormData(editingField);
//         } else {
//             setFormData({
//                 name: "",
//                 label: "",
//                 type: "text",
//                 placeholder: "",
//                 required: false,
//                 options: [],
//                 column: selectedColumn,
//             });
//         }
//     }, [editingField, selectedColumn]);

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!formData.name || !formData.label) {
//             alert("Vui lòng điền đầy đủ tên trường và nhãn");
//             return;
//         }

//         const fieldConfig: FieldConfig = {
//             id: editingField?.id || `field_${Date.now()}`,
//             name: formData.name!,
//             label: formData.label!,
//             type: formData.type!,
//             placeholder: formData.placeholder,
//             required: formData.required,
//             options: formData.options,
//             column: formData.column!,
//         };

//         onSave(fieldConfig);
//     };

//     const addOption = () => {
//         setFormData({
//             ...formData,
//             options: [...(formData.options || []), { value: "", label: "" }],
//         });
//     };

//     const updateOption = (index: number, field: "value" | "label", value: string) => {
//         const newOptions = [...(formData.options || [])];
//         newOptions[index] = { ...newOptions[index], [field]: value };
//         setFormData({ ...formData, options: newOptions });
//     };

//     const removeOption = (index: number) => {
//         const newOptions = formData.options?.filter((_, i) => i !== index) || [];
//         setFormData({ ...formData, options: newOptions });
//     };

//     const fieldTypes = [
//         { value: "text", label: "Văn bản" },
//         { value: "number", label: "Số" },
//         { value: "email", label: "Email" },
//         { value: "tel", label: "Số điện thoại" },
//         { value: "date", label: "Ngày tháng" },
//         { value: "textarea", label: "Văn bản dài" },
//         { value: "select", label: "Danh sách lựa chọn" },
//         { value: "dropdown", label: "Dropdown" },
//     ];

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
//                     <CardTitle>{editingField ? "Chỉnh sửa trường" : "Thêm trường mới"}</CardTitle>
//                     <Button type="button" variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
//                         <X className="w-4 h-4" />
//                     </Button>
//                 </CardHeader>

//                 <CardContent>
//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         <div className="grid grid-cols-2 gap-4">
//                             <div>
//                                 <Label htmlFor="name">Tên trường *</Label>
//                                 <Input
//                                     id="name"
//                                     value={formData.name}
//                                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                                     placeholder="vd: customerName"
//                                 />
//                             </div>

//                             <div>
//                                 <Label htmlFor="label">Nhãn hiển thị *</Label>
//                                 <Input
//                                     id="label"
//                                     value={formData.label}
//                                     onChange={(e) => setFormData({ ...formData, label: e.target.value })}
//                                     placeholder="vd: Tên khách hàng"
//                                 />
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-2 gap-4">
//                             <div>
//                                 <Label htmlFor="type">Loại trường</Label>
//                                 <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
//                                     <SelectTrigger>
//                                         <SelectValue />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         {fieldTypes.map((type) => (
//                                             <SelectItem key={type.value} value={type.value}>
//                                                 {type.label}
//                                             </SelectItem>
//                                         ))}
//                                     </SelectContent>
//                                 </Select>
//                             </div>

//                             <div>
//                                 <Label htmlFor="column">Cột hiển thị</Label>
//                                 <Select
//                                     value={formData.column?.toString()}
//                                     onValueChange={(value) => setFormData({ ...formData, column: Number.parseInt(value) as 1 | 2 | 3 })}
//                                 >
//                                     <SelectTrigger>
//                                         <SelectValue />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="1">Cột 1</SelectItem>
//                                         <SelectItem value="2">Cột 2</SelectItem>
//                                         <SelectItem value="3">Cột 3</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                         </div>

//                         <div>
//                             <Label htmlFor="placeholder">Placeholder</Label>
//                             <Input
//                                 id="placeholder"
//                                 value={formData.placeholder}
//                                 onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
//                                 placeholder="Văn bản gợi ý cho người dùng"
//                             />
//                         </div>

//                         <div className="flex items-center space-x-2">
//                             <Checkbox
//                                 id="required"
//                                 checked={formData.required}
//                                 onCheckedChange={(checked) => setFormData({ ...formData, required: !!checked })}
//                             />
//                             <Label htmlFor="required">Bắt buộc nhập</Label>
//                         </div>

//                         {(formData.type === "select" || formData.type === "dropdown") && (
//                             <div>
//                                 <div className="flex items-center justify-between mb-2">
//                                     <Label>Danh sách lựa chọn</Label>
//                                     <Button
//                                         type="button"
//                                         variant="outline"
//                                         size="sm"
//                                         onClick={addOption}
//                                         className="flex items-center gap-2 bg-transparent"
//                                     >
//                                         <Plus className="w-4 h-4" />
//                                         Thêm lựa chọn
//                                     </Button>
//                                 </div>

//                                 <div className="space-y-2 max-h-40 overflow-y-auto">
//                                     {formData.options?.map((option, index) => (
//                                         <div key={index} className="flex gap-2 items-center">
//                                             <Input
//                                                 placeholder="Giá trị"
//                                                 value={option.value}
//                                                 onChange={(e) => updateOption(index, "value", e.target.value)}
//                                                 className="flex-1"
//                                             />
//                                             <Input
//                                                 placeholder="Nhãn hiển thị"
//                                                 value={option.label}
//                                                 onChange={(e) => updateOption(index, "label", e.target.value)}
//                                                 className="flex-1"
//                                             />
//                                             <Button
//                                                 type="button"
//                                                 variant="ghost"
//                                                 size="sm"
//                                                 onClick={() => removeOption(index)}
//                                                 className="h-8 w-8 p-0 text-red-500"
//                                             >
//                                                 <Trash2 className="w-4 h-4" />
//                                             </Button>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}

//                         <div className="flex justify-end gap-2 pt-4">
//                             <Button type="button" variant="outline" onClick={onClose}>
//                                 Hủy
//                             </Button>
//                             <Button type="submit">{editingField ? "Cập nhật" : "Thêm trường"}</Button>
//                         </div>
//                     </form>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };
