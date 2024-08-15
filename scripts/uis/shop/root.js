import { formatStr } from "../../api/azaleaFormatting";
import icons from "../../api/icons";
import playerStorage from "../../api/playerStorage";
import shopAPI from "../../api/shopAPI";
import config from "../../config";
import { ActionForm } from "../../lib/form_func";
import { prismarineDb } from "../../lib/prismarinedb";
import uiManager from "../../uiManager";
import { worldTags } from "../../worldTags";

uiManager.addUI(config.uiNames.Shop.Root, "Shop Root", (player, id = shopAPI.getDefaultShop().id)=>{
    let shop = shopAPI.shops.getByID(id);
    let form = new ActionForm();
    form.title(formatStr(shop.data.title, player));
    if(shop.data.description) form.body(formatStr(shop.data.description, player))
    let hasPerms = false;
    if(shop.data.type == "ADMIN_SHOP") {
        hasPerms = prismarineDb.permissions.hasPermission(player, "shopui.edit")
    } else if(shop.data.type == "PLAYER_SHOP") {
        form.button(`§cGo back\n§7Go back`, `textures/blocks/barrier`, (player)=>{
            uiManager.open(player, config.uiNames.PlayerShops.View)
        })
        if(shop.data.owner == playerStorage.getID(player) || prismarineDb.permissions.hasPermission(player, "playershops.delete-any")) {
            form.button(`§cDelete Shop\n§7Delete this shop`, icons.resolve(`leaf/image-557`), (player)=>{
                uiManager.open(player, config.uiNames.Basic.Confirmation, `Are you sure you want to delete §e${shop.data.title}§r?`, ()=>{
                    shopAPI.deleteShop(shop.id);
                    uiManager.open(player, config.uiNames.PlayerShops.Root);
                }, ()=>{
                    uiManager.open(player, config.uiNames.Shop.Root, id);
                })
            })
        }
        if(prismarineDb.permissions.hasPermission(player, "playershops.feature")) {
            form.button(`§e${worldTags.hasTag(`Featured-Shop:${id}`) ? `Unfeature` : `Feature`}\n§7Display this shop`, `textures/items/gold_ingot`, (player)=>{
                if(worldTags.hasTag(`Featured-Shop:${id}`)) {
                    worldTags.removeTag(`Featured-Shop:${id}`)
                } else {
                    worldTags.addTag(`Featured-Shop:${id}`)
                }
                uiManager.open(player, config.uiNames.Shop.Root, id);
            })
        }
        hasPerms = shop.data.owner == playerStorage.getID(player)
        //|| prismarineDb.permissions.hasPermission(player, "shopui.edit");
    }
    if(hasPerms) {
        if(shop.data.type == "PLAYER_SHOP") {
            form.button(`§eSet Icon\n§7Set the icon in shop list`, shop.data.icon ? icons.resolve(shop.data.icon) : icons.resolve(`leaf/image-1202`), (player)=>{
                uiManager.open(player, config.uiNames.IconViewer, 0, (player, iconID)=>{
                    if(iconID != null) {
                        shopAPI.setShopIcon(id, iconID);
                        uiManager.open(player, config.uiNames.Shop.Root, id);
                    } else {
                        uiManager.open(player, config.uiNames.Shop.Root, id);
                    }
                })
            })
        }
        form.button("§6Manage Shop\n§7Edit this shop", icons.resolve("leaf/image-068"), (player)=>{
            uiManager.open(player, config.uiNames.Shop.RootAdmin, id)
        })
    }
    for(const category of shop.data.categories) {
        form.button(`${category.name}${category.subtext ? `\n§r§7${category.subtext}` : ``}`, category.icon ? icons.resolve(category.icon) : null, (player)=>{
            uiManager.open(player, config.uiNames.Shop.Category, id, category.id)
        });
    }
    form.show(player, false, (player, response)=>{})
})