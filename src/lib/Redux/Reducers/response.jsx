import { createSlice } from "@reduxjs/toolkit";

const response_code = createSlice({
    name: "store_response_code",
    initialState: {
        // Folders: [
        //     {
        //         Folder: "root",
        //         Files: ["app.js"],
        //     },
        //     {
        //         Folder: "utils",
        //         Files: ["helpers.js", "multer.js"],
        //     },
        //     {
        //         Folder: "config",
        //         Files: ["passport.js"],
        //     },
        //     {
        //         Folder: "prisma",
        //         Files: ["schema.prisma"],
        //     },
        //     {
        //         Folder: "routes",
        //         Files: {
        //             user: [
        //                 "AuthRoutes.js",
        //                 "ProductRoutes.js",
        //                 "UserRoutes.js",
        //                 "OrderRoutes.js",
        //                 "CartRoutes.js",
        //                 "ViewRoutes.js",
        //             ],
        //             admin: [
        //                 "AuthRoutes.js",
        //                 "ProductRoutes.js",
        //                 "UserRoutes.js",
        //                 "OrderRoutes.js",
        //                 "CartRoutes.js",
        //                 "ViewRoutes.js",
        //             ],
        //         },
        //     },
        //     {
        //         Folder: "controllers",
        //         Files: {
        //             user: [
        //                 "ViewController.js",
        //                 "AuthController.js",
        //                 "UserController.js",
        //                 "ProductController.js",
        //                 "OrderController.js",
        //                 "CartController.js",
        //             ],
        //             admin: [
        //                 "ViewController.js",
        //                 "AuthController.js",
        //                 "UserController.js",
        //                 "ProductController.js",
        //                 "OrderController.js",
        //                 "CartController.js",
        //             ],
        //         },
        //     }
        // ],
        GeneratedFolders: [],
        FoldersPath: [] /*[
            "root/app.js",
            "utils/helpers.js",
            "utils/multer.js",
            "config/passport.js",
            "prisma/schema.prisma",
            "routes/user/AuthRoutes.js",
            "routes/user/ProductRoutes.js",
            "routes/user/UserRoutes.js",
            "routes/user/OrderRoutes.js",
            "routes/user/CartRoutes.js",
            "routes/user/ViewRoutes.js",
            "routes/admin/AuthRoutes.js",
            "routes/admin/ProductRoutes.js",
            "routes/admin/UserRoutes.js",
            "routes/admin/OrderRoutes.js",
            "routes/admin/CartRoutes.js",
            "routes/admin/ViewRoutes.js",
            "controllers/user/ViewController.js",
            "controllers/user/AuthController.js",
            "controllers/user/UserController.js",
            "controllers/user/ProductController.js",
            "controllers/user/OrderController.js",
            "controllers/user/CartController.js",
            "controllers/admin/ViewController.js",
            "controllers/admin/AuthController.js",
            "controllers/admin/UserController.js",
            "controllers/admin/ProductController.js",
            "controllers/admin/OrderController.js",
            "controllers/admin/CartController.js"
        ]*/,
        Database_Tables: [] /*[
            {
                Table: "User.js",
                Columns: [
                    {
                        name: "id",
                        type: "primary_key",
                        isNullable: true,
                    },
                    {
                        name: "name",
                        type: "string",
                        isNullable: true,

                    },
                    {
                        name: "username",
                        type: "string",
                        isNullable: true

                    },
                    {
                        name: "phone",
                        type: "int",
                        isNullable: true

                    },
                    {
                        name: "password",
                        type: "string",
                        isNullable: true
                    }
                ]
            },
            {
                Table: "Product.js",
                Columns: [
                    {
                        name: "id",
                        type: "primary_key",
                        isNullable: true
                    },
                    {
                        name: "name",
                        type: "string",
                        isNullable: true
                    },
                    {
                        name: "price",
                        type: "int",
                        isNullable: true
                    },
                    {
                        name: "description",
                        type: "string",
                        isNullable: true
                    },
                    {
                        name: "categoryId",
                        type: "int",
                        isNullable: true
                    }
                ]
            },
            {
                Table: "Order.js",
                Columns: [
                    {
                        name: "id",
                        type: "primary_key",
                        isNullable: true
                    },
                    {
                        name: "userId",
                        type: "int",
                        isNullable: true
                    },
                    {
                        name: "orderDate",
                        type: "date",
                        isNullable: true
                    },
                    {
                        name: "status",
                        type: "string",
                        isNullable: true
                    },
                    {
                        name: "total",
                        type: "int",
                        isNullable: true
                    }
                ]
            },
            {
                Table: "Cart.js",
                Columns: [
                    {
                        name: "id",
                        type: "primary_key",
                        isNullable: true
                    },
                    {
                        name: "userId",
                        type: "int",
                        isNullable: true
                    },
                    {
                        name: "productId",
                        type: "int",
                        isNullable: true
                    },
                    {
                        name: "quantity",
                        type: "int",
                        isNullable: true
                    }
                ]
            },
            {
                Table: "Category.js",
                Columns: [
                    {
                        name: "id",
                        type: "primary_key",
                        isNullable: true
                    },
                    {
                        name: "name",
                        type: "string",
                        isNullable: false
                    },
                    {
                        name: "description",
                        type: "string",
                        isNullable: true
                    }
                ]
            }
        ]*/,
        chats: []
    },
    reducers: {

        setGeneratedFolders: (state, action) => {
            if (!action.payload) return;

            const filePath = action.payload;
            const parts = filePath.split("/");
            const fileName = parts.pop();
            const baseFolder = parts.shift();
            const subFolders = parts;


            let folderIndex = state.GeneratedFolders.findIndex(el => el.Folder === baseFolder);

            if (folderIndex === -1) {
                state.GeneratedFolders.push({
                    Folder: baseFolder,
                    Files: subFolders.length ? {} : [fileName]
                });
                folderIndex = state.GeneratedFolders.length - 1;
            }

            let folder = state.GeneratedFolders[folderIndex];

            if (subFolders.length === 0) {
                if (!Array.isArray(folder.Files)) {
                    folder.Files = [];
                }
                // Prevent duplicate files
                if (!folder.Files.includes(fileName)) {
                    folder.Files.push(fileName);
                    folder.Files.sort();
                }
            } else {
                let current = folder.Files;
                subFolders.forEach((subFolder, index) => {
                    if (!current[subFolder]) {
                        current[subFolder] = index === subFolders.length - 1 ? [] : {};
                    }
                    if (index === subFolders.length - 1) {
                        // Prevent duplicate files
                        if (!current[subFolder].includes(fileName)) {
                            current[subFolder].push(fileName);
                            current[subFolder].sort();
                        }
                    } else {
                        current = current[subFolder];
                    }
                });
            }
        },
        AddColumn: (state, action) => {
            console.log(action.payload);
            const Index = state.Database_Tables.findIndex(el => el.Table == action.payload);

            if (Index >= 0) {
                state.Database_Tables[Index].Columns.push({
                    id: Date.now(),
                    name: '',
                    type: '',
                    isNullable: false
                });
            }
        },
        DeleteColumn: (state, action) => {
            const { Model, Index } = action.payload;
            const DeleteSchemaIndex = state.Database_Tables.findIndex(schema => schema.Table === Model);
            state.Database_Tables[DeleteSchemaIndex].Columns.splice(Index, 1);
        },

        UpdateColumn: (state, action) => {
            const { Index, Model, Value } = action.payload;

            const SchemaIndex = state.Database_Tables.findIndex(item => item.Table === Model);
            const currentColumn = state.Database_Tables[SchemaIndex].Columns[Index];

            if (Value.columnName) {
                state.Database_Tables[SchemaIndex].Columns[Index] = {
                    ...currentColumn,
                    name: Value.columnName
                }
            } else if (Value.DataType) {
                console.log(Value.DataType)
                state.Database_Tables[SchemaIndex].Columns[Index] = {
                    ...currentColumn,
                    type: Value.DataType
                }
            } else if (Value.Nullable) {
                console.log(Value.Nullable)
                state.Database_Tables[SchemaIndex].Columns[Index] = {
                    ...currentColumn,
                    isNullable: Value.Nullable
                }
            }
        },

        setFoldersPath: (state, action) => {

            if (Array.isArray(action.payload)) {
                state.FoldersPath = action.payload;
            }
        },

        setDatabaseTable: (state, action) => {
            // Database_Tables
            if (Array.isArray(action.payload)) {
                state.Database_Tables = action.payload;
            }

        },

        setChats: (state, action) => {
            console.log(action.payload)
            const responseArrays = action.payload;
            responseArrays.forEach((responseArray) => {
                console.log(responseArray)
                state.chats = [...state.chats, responseArray];
            })
        }

    }
})

export const { setGeneratedFolders, AddColumn, DeleteColumn, UpdateColumn, setDatabaseTable, setFoldersPath, setChats } = response_code.actions;
export default response_code.reducer;