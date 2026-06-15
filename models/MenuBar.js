import { Schema, models, model } from "mongoose";
import Packages from "@/models/Packages"
const MenuBarSchema = new Schema(
    {
        active: { type: Boolean },
        order: { type: Number },
        title: { type: String },
        subMenu: [
            {
                title: { type: String },
                url: { type: String },
                active: { type: Boolean },
                order: { type: Number },
                banner: { url: { type: String }, key: { type: String } },
                profileImage: { url: { type: String }, key: { type: String } },
                packages: { type: [Schema.Types.ObjectId], ref: "Packages"},
            }
        ]
    },
    { timestamps: true }
);

export default models.MenuBar || model("MenuBar", MenuBarSchema);
