// TileMask.js Ver.1.2.0
// MIT License (C) 2025 あわやまたな
// http://opensource.org/licenses/mit-license.php

/*:
* @target MZ
* @plugindesc Mask the map according to the region.
* @author あわやまたな (Awaya_Matana)
* @url https://awaya3ji.seesaa.net/article/509947274.html
* @help Ver.1.2.0
* [Paste]
* You can use it when you want to partially change the mask or fill.
*
* Overwrites the mask and fill settings for the specified area.
* It is possible to paste different settings to the upper and lower layers.
* The layer with -1 pasted on it will revert to its original state.
*
* Pasting only changes the mask and fill settings.
* The region ID obtained from event commands etc. will not change.
* This allows you to mask or fill the map without affecting encounters or overpasses in any way.
*
* [Replace]
* Specify the conditions and paste.
* Pasting will only occur if the mask and fill of a specific area meet the conditions.
*
* [Region ID]
* Region IDs 0-255 correspond to map regions.
* Values ​​256 and above can be used as settings specifically for masking and filling.
* Just like 0 to 255, values ​​from 256 onwards can also be reflected in the map by pasting or replacing.
*
* [Note（for Events）]
* <tileMask> //Apply local opacity based on priority.
* <tileMask:upper> //Applies the opacity of the local upper tile.
* <tileMask:lower> //Applies the opacity of the local lower tile.
* <tileMask:n> //Applies region opacity based on priority (n=Region ID).
* <tileMask:n,upper> //Applies the opacity of the upper tile of the region (n:Region ID).
* <tileMask:n,lower> //Applies the opacity of the lower tile of the region (n:Region ID).
* <tileMask:false> //Does not apply tile opacity.
* <tileMaskRatio:n> //Specify the applied opacity ratio (n=0 to 1).
*
* @param upperLayer
* @text Upper Layer Settings
* @desc Default setting.
* @type struct<settings>
* @default {"fillColor":"0,0,0","fillBlendMode":"0","maskSmooth":"false","fillSmooth":"true"}
*
* @param lowerLayer
* @text Lower Layer Settings
* @desc Default setting.
* @type struct<settings>
* @default {"fillColor":"0,0,0","fillBlendMode":"0","maskSmooth":"false","fillSmooth":"true"}
*
* @param maskCharacter
* @text Mask Character
* @desc Applies tile opacity to the character initially.
* *Same as <tileMask>
* @type boolean
* @default false
*
* @param maskBalloon
* @text Mask Balloon
* @desc Link the tile opacity of the character and the opacity of the balloon.
* @type boolean
* @default false
*
* @param considerMapEdges
* @text Consider Map Edges
* @desc Fills to the edge of the map when smoothing.
* @type boolean
* @default false
*
* @command setMaskOpacity
* @text Set Mask Opacity
* @desc Changes the opacity of the tiles in the specified region.
* @arg regionId
* @text Region ID
* @desc Specify multiple entries separated by commas, or specify a range separated by hyphens. Example: 0,2,8-16,24
* @default 0
* @arg layer
* @text Layer
* @default Upper
* @type select
* @option All
* @value All
* @option Upper Layer
* @value Upper
* @option Lower Layer
* @value Lower
* @arg opacity
* @text Opacity
* @desc 
* @default 255
* @arg duration
* @text Duration
* @desc Instantly applied at 0
* @default 0
* @arg wait
* @text Wait for Completion
* @default false
* @type boolean
*
* @command setMaskSmooth
* @text Set Mask Smooth
* @desc Changes the smoothing of the mask.
* @arg layer
* @text Layer
* @default Upper
* @type select
* @option All
* @value All
* @option Upper Layer
* @value Upper
* @option Lower Layer
* @value Lower
* @arg smooth
* @text Smooth
* @type boolean
* @default false
*
* @command setFillOpacity
* @text Set Fill Opacity
* @desc Changes the fill opacity of the specified region.
* @arg regionId
* @text Region ID
* @desc Specify multiple entries separated by commas, or specify a range separated by hyphens. Example: 0,2,8-16,24
* @default 0
* @arg layer
* @text Layer
* @default Upper
* @type select
* @option All
* @value All
* @option Upper Layer
* @value Upper
* @option Lower Layer
* @value Lower
* @arg opacity
* @text Opacity
* @desc 
* @default 255
* @arg duration
* @text Duration
* @desc Instantly applied at 0
* @default 0
* @arg wait
* @text Wait for Completion
* @default false
* @type boolean
*
* @command setFillColor
* @text Set Fill Color
* @desc Changes the fill color for the specified region.
* @arg regionId
* @text Region ID
* @desc Specify multiple entries separated by commas, or specify a range separated by hyphens. Example: 0,2,8-16,24
* @default 0
* @arg layer
* @text Layer
* @default Upper
* @type select
* @option All
* @value All
* @option Upper Layer
* @value Upper
* @option Lower Layer
* @value Lower
* @arg color
* @text Color
* @desc Set R,G,B values ​​separated by commas.
* @type combo
* @option Default
* @default Default
*
* @command setFillBlendMode
* @text Set Fill Blend Mode
* @desc Changes the fill blend mode for the specified region.
* @arg layer
* @text Layer
* @default Upper
* @type select
* @option All
* @value All
* @option Upper Layer
* @value Upper
* @option Lower Layer
* @value Lower
* @arg blendMode
* @text Blend Mode
* @type select
* @option Normal
* @value 0
* @option Additive
* @value 1
* @option Multiply
* @value 2
* @option Screen
* @value 3
* @default 0
*
* @command setFillSmooth
* @text Set Fill Smooth
* @desc Changes the smoothing of the fill.
* @arg layer
* @text Layer
* @default Upper
* @type select
* @option All
* @value All
* @option Upper Layer
* @value Upper
* @option Lower Layer
* @value Lower
* @arg smooth
* @text Smooth
* @type boolean
* @default true
*
* @command pasteMaskSettings
* @text Paste Mask Settings
* @desc Makes the specified coordinates the same mask as the region.
* @arg regionId
* @text Region ID
* @desc Reset to -1.
* @default -1
* @arg layer
* @text Layer
* @default Upper
* @type select
* @option All
* @value All
* @option Upper Layer
* @value Upper
* @option Lower Layer
* @value Lower
* @arg coords
* @text Coordinates
* @desc Set the X-coord,Y-coord,Width,Height, separated by commas.
* Width and height are set to 1 if not entered.
* @type combo
* @option All
* @default All
*
* @command replaceMaskSettings
* @text Replace Mask Settings
* @desc Replaces the region settings for coordinates that match the conditions.
* @arg target
* @text Search Target
* @desc Refers to the specified target.
* @default Tile
* @type select
* @option Current Settings
* @value Current
* @option Tile Settings
* @value Tile
* @option Region Settings
* @value Region
* @arg regionId
* @text Region ID
* @desc ID to replace
* -1 is the initial value for the tile.
* @default -1
* @arg replaceId
* @text Replace ID
* @desc ID of replacement destination
* -1 is the initial value for the tile.
* @default -1
* @arg layer
* @text Layer
* @desc Search and replace in the specified layer. If you select "All", the replacement will be performed on both layers.
* @default Upper
* @type select
* @option All
* @value All
* @option Upper Layer
* @value Upper
* @option Lower Layer
* @value Lower
* @arg coords
* @text Coordinates
* @desc Set the X-coord,Y-coord,Width,Height, separated by commas.
* Width and height are set to 1 if not entered.
* @type combo
* @option All
* @default All
*
* @command pasteFillSettings
* @text Paste Fill Settings
* @desc Gives the specified coordinates the same fill as the region.
* @arg regionId
* @text Region ID
* @desc Reset to -1.
* @default -1
* @arg layer
* @text Layer
* @default Upper
* @type select
* @option All
* @value All
* @option Upper Layer
* @value Upper
* @option Lower Layer
* @value Lower
* @arg coords
* @text Coordinates
* @desc Set the X-coord,Y-coord,Width,Height, separated by commas.
* Width and height are set to 1 if not entered.
* @type combo
* @option All
* @default All
*
* @command replaceFillSettings
* @text Replace Fill Settings
* @desc Replaces the region settings for coordinates that match the conditions.
* @arg target
* @text Search Target
* @desc Refers to the specified target.
* @default Tile
* @type select
* @option Current Settings
* @value Current
* @option Tile Settings
* @value Tile
* @option Region Settings
* @value Region
* @arg regionId
* @text Region ID
* @desc ID to replace
* -1 is the initial value for the tile.
* @default -1
* @arg replaceId
* @text Replace ID
* @desc ID of replacement destination
* -1 is the initial value for the tile.
* @default -1
* @arg layer
* @text Layer
* @desc Search and replace in the specified layer. If you select "All", the replacement will be performed on both layers.
* @default Upper
* @type select
* @option All
* @value All
* @option Upper Layer
* @value Upper
* @option Lower Layer
* @value Lower
* @arg coords
* @text Coordinates
* @desc Set the X-coord,Y-coord,Width,Height, separated by commas.
* Width and height are set to 1 if not entered.
* @type combo
* @option All
* @default All
*
* @command setCharacterMask
* @text Set Character Mask
* @desc Apply tile opacity to the character.
* @arg characterId
* @text Character ID
* @desc Player: -1  This Event: 0
* @default -1
* @arg mode
* @text Mode
* @default -1
* @type select
* @option Upper Opacity
* @value 1
* @option Lower Opacity
* @value 0
* @option Auto
* @value -1
* @option Disabled
* @value -2
* @arg regionId
* @text Region ID
* @desc -1 is the local region ID.
* @default -1
* @arg ratio
* @text Ratio
* @desc The opacity ratio.
* @default 1
*
*/

/*:ja
* @target MZ
* @plugindesc リージョンに応じてマップをマスクします。
* @author あわやまたな (Awaya_Matana)
* @url https://awaya3ji.seesaa.net/article/509947274.html
* @help [貼り付け]
* マスクや塗り潰しを局所的に変更したい時に使えます。
*
* 指定した範囲のマスク及び塗り潰し設定を上書きする事ができます。
* 上層、下層で異なる設定を貼り付け可能です。
* -1を貼り付けたレイヤーは元に戻ります。
*
* 貼り付けを行っても変わるのはマスクと塗り潰しの設定のみです。
* イベントコマンドなどから取得されるリージョンIDは変化しません。
* よってエンカウントや立体交差に一切影響を及ぼすことなくマップをマスクしたり塗り潰したりできます。
*
* [置換]
* 条件を指定して貼り付けを行います。
* 特定範囲のマスク及び塗り潰しが条件に合致する場合のみ貼り付けを行います。
*
* [リージョンID]
* リージョンIDの0～255はマップのリージョンに対応します。
* 256以降はマスクと塗り潰し専用の設定として扱うことができます。
* 0～255と同じように256以降の値も貼り付けや置換でマップに反映する事が可能です。
*
* [メモ（イベント）]
* <tileMask> //その場の不透明度をプライオリティに応じて適用します。
* <tileMask:upper> //その場の上層タイルの不透明度を適用します。
* <tileMask:lower> //その場の下層タイルの不透明度を適用します。
* <tileMask:リージョンID> //リージョンの不透明度をプライオリティに応じて適用します。
* <tileMask:リージョンID,upper> //リージョンの上層タイルの不透明度を適用します。
* <tileMask:リージョンID,lower> //リージョンの下層タイルの不透明度を適用します。
* <tileMask:false> //タイルの不透明度を適用しません。
* <tileMaskRatio:n> //不透明度の適用倍率を指定します（n=0～1）。
*
* [更新履歴]
* 2025/02/02：Ver.1.0.0　公開。
* 2025/02/10：Ver.1.1.0　キャラクターにタイルの不透明度を適用可能にしました。
* 2025/09/02：Ver.1.2.0　パラメータ[マップの端を考慮]を追加。
*
* @param upperLayer
* @text 上層設定
* @desc 初期設定です。
* @type struct<settings>
* @default {"fillColor":"0,0,0","fillBlendMode":"0","maskSmooth":"false","fillSmooth":"true"}
*
* @param lowerLayer
* @text 下層設定
* @desc 初期設定です。
* @type struct<settings>
* @default {"fillColor":"0,0,0","fillBlendMode":"0","maskSmooth":"false","fillSmooth":"true"}
*
* @param maskCharacter
* @text キャラクターをマスク
* @desc 初期状態でキャラクターにタイルの不透明度を適用します。
* ※<tileMask>と同じ
* @type boolean
* @default false
*
* @param maskBalloon
* @text フキダシアイコンをマスク
* @desc キャラクターのタイル不透明度とフキダシアイコンの不透明度を連動します。
* @type boolean
* @default false
*
* @param considerMapEdges
* @text マップの端を考慮
* @desc スムージング適用時にマップの端までしっかり埋めます。
* @type boolean
* @default false
*
* @command setMaskOpacity
* @text マスク不透明度の設定
* @desc 指定したリージョンにあるタイルの不透明度を変更します。
* @arg regionId
* @text リージョンID
* @desc コンマ区切りで複数指定、ハイフン区切りで範囲指定。
* 例：0,2,8-16,24
* @default 0
* @arg layer
* @text レイヤー
* @default Upper
* @type select
* @option 全て
* @value All
* @option 上層
* @value Upper
* @option 下層
* @value Lower
* @arg opacity
* @text 不透明度
* @desc 
* @default 255
* @arg duration
* @text 時間
* @desc 0で瞬間適用
* @default 0
* @arg wait
* @text 完了までウェイト
* @default false
* @type boolean
*
* @command setMaskSmooth
* @text マスク円滑化の設定
* @desc マスクのスムージングを変更します。
* @arg layer
* @text レイヤー
* @default Upper
* @type select
* @option 全て
* @value All
* @option 上層
* @value Upper
* @option 下層
* @value Lower
* @arg smooth
* @text 円滑化
* @type boolean
* @default false
*
* @command setFillOpacity
* @text 塗り潰し不透明度の設定
* @desc 指定したリージョンの塗り潰しの不透明度を変更します。
* @arg regionId
* @text リージョンID
* @desc コンマ区切りで複数指定、ハイフン区切りで範囲指定。
* 例：0,2,8-16,24
* @default 0
* @arg layer
* @text レイヤー
* @default Upper
* @type select
* @option 全て
* @value All
* @option 上層
* @value Upper
* @option 下層
* @value Lower
* @arg opacity
* @text 不透明度
* @desc 
* @default 255
* @arg duration
* @text 時間
* @desc 0で瞬間適用
* @default 0
* @arg wait
* @text 完了までウェイト
* @default false
* @type boolean
*
* @command setFillColor
* @text 塗り潰しカラーの設定
* @desc 指定したリージョンを塗り潰す色を変更します。
* @arg regionId
* @text リージョンID
* @desc コンマ区切りで複数指定、ハイフン区切りで範囲指定。
* 例：0,2,8-16,24
* @default 0
* @arg layer
* @text レイヤー
* @default Upper
* @type select
* @option 全て
* @value All
* @option 上層
* @value Upper
* @option 下層
* @value Lower
* @arg color
* @text 色
* @desc コンマ区切りでR,G,Bを設定。
* @type combo
* @option Default
* @default Default
*
* @command setFillBlendMode
* @text 塗り潰し合成方法の設定
* @desc 指定したリージョンを塗り潰す色の合成方法を変更します。
* @arg layer
* @text レイヤー
* @default Upper
* @type select
* @option 全て
* @value All
* @option 上層
* @value Upper
* @option 下層
* @value Lower
* @arg blendMode
* @text 合成方法
* @type select
* @option 通常
* @value 0
* @option 加算
* @value 1
* @option 乗算
* @value 2
* @option スクリーン
* @value 3
* @default 0
*
* @command setFillSmooth
* @text 塗り潰し円滑化の設定
* @desc 塗り潰しのスムージングを変更します。
* @arg layer
* @text レイヤー
* @default Upper
* @type select
* @option 全て
* @value All
* @option 上層
* @value Upper
* @option 下層
* @value Lower
* @arg smooth
* @text 円滑化
* @type boolean
* @default true
*
* @command pasteMaskSettings
* @text マスク設定の貼り付け
* @desc 指定した座標をリージョンと同じマスクにします。
* 既にリージョンのある場所はこちらのマスク設定が優先されます。
* @arg regionId
* @text リージョンID
* @desc -1で解除。
* @default -1
* @arg layer
* @text レイヤー
* @default Upper
* @type select
* @option 全て
* @value All
* @option 上層
* @value Upper
* @option 下層
* @value Lower
* @arg coords
* @text 座標
* @desc コンマ区切りでX座標,Y座標,幅,高さを設定。
* 幅、高さは入力しないと1になります。
* @type combo
* @option All
* @default All
*
* @command replaceMaskSettings
* @text マスク設定の置換
* @desc 条件に合致する座標のリージョン設定を置換します。
* @arg target
* @text 検索対象
* @desc 指定した対象を参照します。
* @default Tile
* @type select
* @option 現在の設定値
* @value Current
* @option タイルの設定値
* @value Tile
* @option リージョンの設定値
* @value Region
* @arg regionId
* @text リージョンID
* @desc 置き換え元のID
* -1はタイルの初期値です。
* @default -1
* @arg replaceId
* @text 置換ID
* @desc 置き換え先のID
* -1はタイルの初期値です。
* @default -1
* @arg layer
* @text レイヤー
* @desc 指定したレイヤーを検索して置換します。
* 「全て」の場合は上層と下層の置換がそれぞれ実行されます。
* @default Upper
* @type select
* @option 全て
* @value All
* @option 上層
* @value Upper
* @option 下層
* @value Lower
* @arg coords
* @text 座標
* @desc コンマ区切りでX座標,Y座標,幅,高さを設定。
* 幅、高さは入力しないと1になります。
* @type combo
* @option All
* @default All
*
* @command pasteFillSettings
* @text 塗り潰し設定の貼り付け
* @desc 指定した座標をリージョンと同じ塗り潰しにします。
* 既にリージョンのある場所はこちらの塗り潰し設定が優先されます。
* @arg regionId
* @text リージョンID
* @desc -1で元に戻す。
* @default -1
* @arg layer
* @text レイヤー
* @default Upper
* @type select
* @option 全て
* @value All
* @option 上層
* @value Upper
* @option 下層
* @value Lower
* @arg coords
* @text 座標
* @desc コンマ区切りでX座標,Y座標,幅,高さを設定。
* 幅、高さは入力しないと1になります。
* @type combo
* @option All
* @default All
*
* @command replaceFillSettings
* @text 塗り潰し設定の置換
* @desc 条件に合致する座標のリージョン設定を置換します。
* @arg target
* @text 検索対象
* @desc 指定した対象を参照します。
* @default Tile
* @type select
* @option 現在の設定値
* @value Current
* @option タイルの設定値
* @value Tile
* @option リージョンの設定値
* @value Region
* @arg regionId
* @text リージョンID
* @desc 置き換え元のID
* -1はタイルの初期値です。
* @default -1
* @arg replaceId
* @text 置換ID
* @desc 置き換え先のID
* -1はタイルの初期値です。
* @default -1
* @arg layer
* @text レイヤー
* @desc 指定したレイヤーを検索して置換します。
* 「全て」の場合は上層と下層の置換がそれぞれ実行されます。
* @default Upper
* @type select
* @option 全て
* @value All
* @option 上層
* @value Upper
* @option 下層
* @value Lower
* @arg coords
* @text 座標
* @desc コンマ区切りでX座標,Y座標,幅,高さを設定。
* 幅、高さは入力しないと1になります。
* @type combo
* @option All
* @default All
*
* @command setCharacterMask
* @text キャラクターのマスク設定
* @desc キャラクターにタイルの不透明度を適用します。
* @arg characterId
* @text キャラクターID
* @desc プレイヤー：-1　このイベント：0
* @default -1
* @arg mode
* @text モード
* @default -1
* @type select
* @option 上層の不透明度
* @value 1
* @option 下層の不透明度
* @value 0
* @option 自動
* @value -1
* @option 無効
* @value -2
* @arg regionId
* @text リージョンID
* @desc -1は足元のリージョンIDです。
* @default -1
* @arg ratio
* @text 倍率
* @desc 不透明度の適用倍率です。
* @default 1
*
*/

/*~struct~settings:
*
* @param fillColor
* @text Fill Color
* @desc Set R,G,B values ​​separated by commas.
* @default 0,0,0
*
* @param fillBlendMode
* @text Fill Blend Mode
* @type select
* @option Normal
* @value 0
* @option Additive
* @value 1
* @option Multiply
* @value 2
* @option Screen
* @value 3
* @default 0
*
* @param maskSmooth
* @text Mask Smoothing
* @desc Round the border.
* @type boolean
* @default false
*
* @param fillSmooth
* @text Fill Smoothing
* @desc Round the border.
* @type boolean
* @default true
*/

/*~struct~settings:ja
*
* @param fillColor
* @text 塗り潰しカラー
* @desc コンマ区切りでR,G,Bを設定。
* @default 0,0,0
*
* @param fillBlendMode
* @text 塗り潰し合成方法
* @type select
* @option 通常
* @value 0
* @option 加算
* @value 1
* @option 乗算
* @value 2
* @option スクリーン
* @value 3
* @default 0
*
* @param maskSmooth
* @text マスクのスムージング
* @desc 境界を丸めます。
* @type boolean
* @default false
*
* @param fillSmooth
* @text 塗り潰しのスムージング
* @desc 境界を丸めます。
* @type boolean
* @default true
*/

'use strict';
{
	const pluginName = document.currentScript.src.match(/^.*\/(.*).js$/)[1];
	const parameters = PluginManager.parameters(pluginName);
	const _PluginManager = window.PluginManagerEx ?? PluginManager;
	const _pluginName = window.PluginManagerEx ? document.currentScript : pluginName;

	const maskMode = parameters.maskCharacter === "true" ? -1 : -2;
	const maskBalloon = parameters.maskBalloon === "true";
	const considerMapEdges = parameters.considerMapEdges === "true";

	const upperLayer = JSON.parse(parameters.upperLayer || "{}");
	const upperFillColor = upperLayer.fillColor || "0,0,0";
	const upperFillBlendMode = Number(upperLayer.fillBlendMode || 0);
	const upperMaskSmooth = upperLayer.maskSmooth === "true";
	const upperFillSmooth = upperLayer.fillSmooth !== "false";

	const lowerLayer = JSON.parse(parameters.lowerLayer || "{}");
	const lowerFillColor = lowerLayer.fillColor || "0,0,0";
	const lowerFillBlendMode = Number(lowerLayer.fillBlendMode || 0);
	const lowerMaskSmooth = lowerLayer.maskSmooth === "true";
	const lowerFillSmooth = lowerLayer.fillSmooth !== "false";

	//-----------------------------------------------------------------------------
	// PluginManager

	_PluginManager.registerCommand(_pluginName, "setMaskOpacity", function(args) {
		const regionIds = extractRegionIds(args.regionId);
		const opacity = +args.opacity;
		const d = +args.duration;
		let upper = false;
		let lower = false;
		switch (args.layer) {
			case "Upper":
				upper = true;
				break;
			case "Lower":
				lower = true;
				break;
			default:
				upper = true;
				lower = true;
				break;
		}
		for (const regionId of regionIds) {
			const params = [regionId, opacity, d];
			if (upper) $gameMap.setRegionMaskOpacity(1, ...params);
			if (lower) $gameMap.setRegionMaskOpacity(0, ...params);
		}
		if (d && String(args.wait) === "true") {
			this.wait(d);
		}
	});

	_PluginManager.registerCommand(_pluginName, "setFillOpacity", function(args) {
		const regionIds = extractRegionIds(args.regionId);
		const opacity = +args.opacity;
		const d = +args.duration;
		let upper = false;
		let lower = false;
		switch (args.layer) {
			case "Upper":
				upper = true;
				break;
			case "Lower":
				lower = true;
				break;
			default:
				upper = true;
				lower = true;
				break;
		}
		for (const regionId of regionIds) {
			const params = [regionId, opacity, d];
			if (upper) $gameMap.setRegionFillOpacity(1, ...params);
			if (lower) $gameMap.setRegionFillOpacity(0, ...params);
		}
		if (d && String(args.wait) === "true") {
			this.wait(d);
		}
	});

	_PluginManager.registerCommand(_pluginName, "setFillColor", function(args) {
		const regionIds = extractRegionIds(args.regionId);
		const color = args.color === "Default" ? null : (args.color || "0,0,0").split(",").map(Number);
		let upper = false;
		let lower = false;
		switch (args.layer) {
			case "Upper":
				upper = true;
				break;
			case "Lower":
				lower = true;
				break;
			default:
				upper = true;
				lower = true;
				break;
		}
		for (const regionId of regionIds) {
			const params = [regionId, color];
			if (upper) $gameMap.setRegionFillColor(1, ...params);
			if (lower) $gameMap.setRegionFillColor(0, ...params);
		}
	});

	_PluginManager.registerCommand(_pluginName, "setFillBlendMode", function(args) {
		const blendMode = +args.blendMode;
		let upper = false;
		let lower = false;
		switch (args.layer) {
			case "Upper":
				upper = true;
				break;
			case "Lower":
				lower = true;
				break;
			default:
				upper = true;
				lower = true;
				break;
		}
		if (upper) $gameMap.setRegionFillBlendMode(1, blendMode);
		if (lower) $gameMap.setRegionFillBlendMode(0, blendMode);
	});

	_PluginManager.registerCommand(_pluginName, "setMaskSmooth", function(args) {
		const smooth = String(args.smooth) === "true";
		let upper = false;
		let lower = false;
		switch (args.layer) {
			case "Upper":
				upper = true;
				break;
			case "Lower":
				lower = true;
				break;
			default:
				upper = true;
				lower = true;
				break;
		}
		if (upper) $gameMap.setRegionMaskSmooth(1, smooth);
		if (lower) $gameMap.setRegionMaskSmooth(0, smooth);
	});

	_PluginManager.registerCommand(_pluginName, "setFillSmooth", function(args) {
		const smooth = String(args.smooth) === "true";
		let upper = false;
		let lower = false;
		switch (args.layer) {
			case "Upper":
				upper = true;
				break;
			case "Lower":
				lower = true;
				break;
			default:
				upper = true;
				lower = true;
				break;
		}
		if (upper) $gameMap.setRegionFillSmooth(1, smooth);
		if (lower) $gameMap.setRegionFillSmooth(0, smooth);
	});

	_PluginManager.registerCommand(_pluginName, "pasteMaskSettings", function(args) {
		const rect = extractRect(args.coords);
		const params = [+args.regionId, rect];
		let upper = false;
		let lower = false;
		switch (args.layer) {
			case "Upper":
				upper = true;
				break;
			case "Lower":
				lower = true;
				break;
			default:
				upper = true;
				lower = true;
				break;
		}
		if (upper) $gameMap.pasteRegionMaskToTile(1, ...params);
		if (lower) $gameMap.pasteRegionMaskToTile(0, ...params);
	});

	_PluginManager.registerCommand(_pluginName, "pasteFillSettings", function(args) {
		const rect = extractRect(args.coords);
		const params = [+args.regionId, rect];
		let upper = false;
		let lower = false;
		switch (args.layer) {
			case "Upper":
				upper = true;
				break;
			case "Lower":
				lower = true;
				break;
			default:
				upper = true;
				lower = true;
				break;
		}
		if (upper) $gameMap.pasteRegionFillToTile(1, ...params);
		if (lower) $gameMap.pasteRegionFillToTile(0, ...params);
	});

	_PluginManager.registerCommand(_pluginName, "replaceMaskSettings", function(args) {
		const rect = extractRect(args.coords);
		let targetId = 0;
		switch (args.target) {
			case "Tile":
				targetId = 1;
				break;
			case "Region":
				targetId = 2;
				break;
		}
		const params = [targetId, +args.regionId, +args.replaceId, rect];
		let upper = false;
		let lower = false;
		switch (args.layer) {
			case "Upper":
				upper = true;
				break;
			case "Lower":
				lower = true;
				break;
			default:
				upper = true;
				lower = true;
				break;
		}
		if (upper) $gameMap.replaceRegionMaskToTile(1, ...params);
		if (lower) $gameMap.replaceRegionMaskToTile(0, ...params);
	});

	_PluginManager.registerCommand(_pluginName, "replaceFillSettings", function(args) {
		const rect = extractRect(args.coords);
		let targetId = 0;
		switch (args.target) {
			case "Tile":
				targetId = 1;
				break;
			case "Region":
				targetId = 2;
				break;
		}
		const params = [targetId, +args.regionId, +args.replaceId, rect];
		let upper = false;
		let lower = false;
		switch (args.layer) {
			case "Upper":
				upper = true;
				break;
			case "Lower":
				lower = true;
				break;
			default:
				upper = true;
				lower = true;
				break;
		}
		if (upper) $gameMap.replaceRegionFillToTile(1, ...params);
		if (lower) $gameMap.replaceRegionFillToTile(0, ...params);
	});

	_PluginManager.registerCommand(_pluginName, "setCharacterMask", function(args) {
		const character = this.character(+args.characterId);
		if (character) {
			character.setTileMaskId(+args.regionId);
			character.setTileMaskMode(+args.mode);
			character.setTileMaskRatio(+args.ratio);
		}
	});

	function extractRegionIds(str) {
		const regionIds = [];
		if (str === "") return regionIds;
		String(str).split(",").forEach(id => {
			if (!isNaN(id)) {
				regionIds.push(Number(id) + 0);
				return;
			}
			const range = id.replace(/to/gi,"-").split("-").map(Number);
			if (isNaN(range[1])) {
				range[1] = range[0];
			}
			if (range[0] > range[1]) {
				for (let i = range[0]; i >= range[1]; i--) {
					regionIds.push(i)
				}
			} else {
				for (let i = range[0]; i <= range[1]; i++) {
					regionIds.push(i);
				}
			}
		});
		return regionIds;
	}

	function extractRect(str) {
		if (str === "All") {
			return new Rectangle(0, 0, $gameMap.width(), $gameMap.height());
		}
		const rect = String(str).split(",").map(Number);
		return new Rectangle(rect[0] || 0, rect[1] || 0, rect[2] || 1, rect[3] || 1);
	}

	//-----------------------------------------------------------------------------
	// Game_Temp

	Game_Temp.prototype.requestTileMaskRefresh = function() {
		this._needsTileMaskRefresh = true;
	};

	Game_Temp.prototype.clearTileMaskRefreshRequest = function() {
		this._needsTileMaskRefresh = false;
	};

	Game_Temp.prototype.isTileMaskRefreshRequested = function() {
		return this._needsTileMaskRefresh;
	};

	Game_Temp.prototype.requestTileFillRefresh = function() {
		this._needsTileFillRefresh = true;
	};

	Game_Temp.prototype.clearTileFillRefreshRequest = function() {
		this._needsTileFillRefresh = false;
	};

	Game_Temp.prototype.isTileFillRefreshRequested = function() {
		return this._needsTileFillRefresh;
	};

	//-----------------------------------------------------------------------------
	// Game_Map

	const _Game_Map_initialize = Game_Map.prototype.initialize;
	Game_Map.prototype.initialize = function() {
		_Game_Map_initialize.call(this);
		this.clearTileMaskData();
	};

	const _Game_Map_setup = Game_Map.prototype.setup;
	Game_Map.prototype.setup = function(mapId) {
		_Game_Map_setup.call(this, mapId);
		this.clearTileMaskData();
		$gamePlayer.setTileMaskId(-1);
		$gamePlayer.setTileMaskMode(maskMode);
		$gamePlayer.setTileMaskRatio(1);
	};

	Game_Map.prototype.clearTileMaskData = function() {
		this._upperRegionMaskData = [];
		this._lowerRegionMaskData = [];
		this._upperRegionFillData = [];
		this._lowerRegionFillData = [];
		this._regionMaskMover = [];
		this._regionFillMover = [];
		this._upperRegionFillColor = [];
		this._lowerRegionFillColor = [];
		this._upperRegionFillBlendMode = upperFillBlendMode;
		this._lowerRegionFillBlendMode = lowerFillBlendMode;
		this._maskTileRegionData = [];
		this._fillTileRegionData = [];
		this._upperRegionMaskSmooth = upperMaskSmooth;
		this._lowerRegionMaskSmooth = lowerMaskSmooth;
		this._upperRegionFillSmooth = upperFillSmooth;
		this._lowerRegionFillSmooth = lowerFillSmooth;
	};

	Game_Map.prototype.regionMaskId = function(x, y, z) {
		const width = $dataMap.width;
		const height = $dataMap.height;
		const maskId = this._maskTileRegionData[(z * height + y) * width + x] ?? -1;
		return maskId > -1 ? maskId : this.regionId(x, y);
	};

	Game_Map.prototype.regionMaskOpacity = function(maskId, z) {
		const maskData = z > 0 ? this._upperRegionMaskData : this._lowerRegionMaskData;
		return maskData[maskId] ?? 255;
	};

	Game_Map.prototype.setRegionMaskOpacity = function(layerId, regionId, opacity, duration) {
		this._regionMaskMover = this._regionMaskMover.filter(obj => obj.regionId !== regionId || obj.layerId !== layerId);
		const maskData = layerId > 0 ? this._upperRegionMaskData : this._lowerRegionMaskData;
		if (duration > 0) {
			this._regionMaskMover.push({
				regionId: regionId,
				opacityTarget: opacity,
				duration: duration,
				layerId: layerId
			});
			maskData[regionId] = maskData[regionId] ?? 255;
		} else if (maskData[regionId] !== opacity) {
			maskData[regionId] = opacity;
			$gameTemp.requestTileMaskRefresh();
		}
	};

	Game_Map.prototype.setRegionFillOpacity = function(layerId, regionId, opacity, duration) {
		this._regionFillMover = this._regionFillMover.filter(obj => obj.regionId !== regionId || obj.layerId !== layerId);
		const fillData = layerId > 0 ? this._upperRegionFillData : this._lowerRegionFillData;
		if (duration > 0) {
			this._regionFillMover.push({
				regionId: regionId,
				opacityTarget: opacity,
				duration: duration,
				layerId: layerId
			});
			fillData[regionId] = fillData[regionId] ?? 0;
		} else if (fillData[regionId] !== opacity) {
			fillData[regionId] = opacity;
			$gameTemp.requestTileFillRefresh();
		}
	};

	Game_Map.prototype.setRegionFillColor = function(layerId, regionId, color) {
		const fillColor = layerId > 0 ? this._upperRegionFillColor : this._lowerRegionFillColor;
		if (color) {
			if (!fillColor[regionId] || !fillColor[regionId].equals(color)) {
				fillColor[regionId] = color.clone();
				$gameTemp.requestTileFillRefresh();
			} 
		} else {
			if (fillColor[regionId]) {
				fillColor[regionId] = null;
				$gameTemp.requestTileFillRefresh();
			}
		}
	};

	Game_Map.prototype.setRegionFillBlendMode = function(layerId, blendMode) {
		const fillBlendMode = layerId > 0 ? "_upperRegionFillBlendMode" : "_lowerRegionFillBlendMode";
		if (this[fillBlendMode] !== blendMode) {
			this[fillBlendMode] = blendMode;
			$gameTemp.requestTileFillRefresh();
		}
	};

	Game_Map.prototype.setRegionMaskSmooth = function(layerId, smooth) {
		const maskSmooth = layerId > 0 ? "_upperRegionMaskSmooth" : "_lowerRegionMaskSmooth";
		if (this[maskSmooth] !== smooth) {
			this[maskSmooth] = smooth;
			$gameTemp.requestTileMaskRefresh();
		}
	};

	Game_Map.prototype.setRegionFillSmooth = function(layerId, smooth) {
		const fillSmooth = layerId > 0 ? "_upperRegionFillSmooth" : "_lowerRegionFillSmooth";
		if (this[fillSmooth] !== smooth) {
			this[fillSmooth] = smooth;
			$gameTemp.requestTileFillRefresh();
		}
	};

	Game_Map.prototype.pasteRegionMaskToTile = function(layerId, regionId, rect) {
		const width = $dataMap.width;
		const height = $dataMap.height;
		let counter = 0;
		const endX = rect.x + rect.width;
		const endY = rect.y + rect.height;
		for (let x = rect.x; x < endX; x++) {
			for (let y = rect.y; y < endY; y++) {
				const roundX = this.roundX(x);
				const roundY = this.roundY(y);
				if (this.isValid(roundX, roundY)) {
					const n = (layerId * height + roundY) * width + roundX;
					const currentId = this._maskTileRegionData[n] ?? -1;
					if (currentId !== regionId) {
						this._maskTileRegionData[n] = regionId;
						counter++;
					}
				}
			}
		}
		if (counter) {
			$gameTemp.requestTileMaskRefresh();
		}
	};

	Game_Map.prototype.pasteRegionFillToTile = function(layerId, regionId, rect) {
		const width = $dataMap.width;
		const height = $dataMap.height;
		let counter = 0;
		const endX = rect.x + rect.width;
		const endY = rect.y + rect.height;
		for (let x = rect.x; x < endX; x++) {
			for (let y = rect.y; y < endY; y++) {
				const roundX = this.roundX(x);
				const roundY = this.roundY(y);
				if (this.isValid(roundX, roundY)) {
					const n = (layerId * height + roundY) * width + roundX;
					const currentId = this._fillTileRegionData[n] ?? -1;
					if (currentId !== regionId) {
						this._fillTileRegionData[n] = regionId;
						counter++;
					}
				}
			}
		}
		if (counter) {
			$gameTemp.requestTileFillRefresh();
		}
	};

	Game_Map.prototype.replaceRegionMaskToTile = function(layerId, targetId, regionId, replaceId, rect) {
		const width = $dataMap.width;
		const height = $dataMap.height;
		let counter = 0;
		const endX = rect.x + rect.width;
		const endY = rect.y + rect.height;
		for (let x = rect.x; x < endX; x++) {
			for (let y = rect.y; y < endY; y++) {
				const roundX = this.roundX(x);
				const roundY = this.roundY(y);
				if (this.isValid(roundX, roundY)) {
					const n = (layerId * height + roundY) * width + roundX;
					let currentId;
					switch (targetId) {
						case 1:
							currentId = this._maskTileRegionData[n] ?? -1;
							break;
						case 2:
							currentId = this.regionId(roundX, roundY);
							break;
						default:
							currentId = this._maskTileRegionData[n] ?? -1;
							if (currentId === -1) {
								currentId = this.regionId(roundX, roundY);
							}
							break;
					}
					if (currentId === regionId) {
						this._maskTileRegionData[n] = replaceId;
						counter++;
					}
				}
			}
		}
		if (counter) {
			$gameTemp.requestTileMaskRefresh();
		}
	};

	Game_Map.prototype.replaceRegionFillToTile = function(layerId, targetId, regionId, replaceId, rect) {
		const width = $dataMap.width;
		const height = $dataMap.height;
		let counter = 0;
		const endX = rect.x + rect.width;
		const endY = rect.y + rect.height;
		for (let x = rect.x; x < endX; x++) {
			for (let y = rect.y; y < endY; y++) {
				const roundX = this.roundX(x);
				const roundY = this.roundY(y);
				if (this.isValid(roundX, roundY)) {
					const n = (layerId * height + roundY) * width + roundX;
					let currentId;
					switch (targetId) {
						case 1:
							currentId = this._fillTileRegionData[n] ?? -1;
							break;
						case 2:
							currentId = this.regionId(roundX, roundY);
							break;
						default:
							currentId = this._fillTileRegionData[n] ?? -1;
							if (currentId === -1) {
								currentId = this.regionId(roundX, roundY);
							}
							break;
					}
					if (currentId === regionId) {
						this._fillTileRegionData[n] = replaceId;
						counter++;
					}
				}
			}
		}
		if (counter) {
			$gameTemp.requestTileFillRefresh();
		}
	};

	const _Game_Map_update = Game_Map.prototype.update;
	Game_Map.prototype.update = function(sceneActive) {
		_Game_Map_update.call(this, sceneActive);
		this.updateTileMaskOpacity();
		this.updateTileFillOpacity();
	};

	Game_Map.prototype.updateTileMaskOpacity = function() {
		if (this._regionMaskMover.length) {
			for (const mover of this._regionMaskMover) {
				const d = mover.duration;
				const maskData = mover.layerId > 0 ? this._upperRegionMaskData : this._lowerRegionMaskData;
				maskData[mover.regionId] = (maskData[mover.regionId] * (d - 1) + mover.opacityTarget) / d;
				mover.duration--;
			}
			this._regionMaskMover = this._regionMaskMover.filter(m => m.duration > 0);
			$gameTemp.requestTileMaskRefresh();
		}
	};

	Game_Map.prototype.updateTileFillOpacity = function() {
		if (this._regionFillMover.length) {
			for (const mover of this._regionFillMover) {
				const d = mover.duration;
				const fillData = mover.layerId > 0 ? this._upperRegionFillData : this._lowerRegionFillData;
				fillData[mover.regionId] = (fillData[mover.regionId] * (d - 1) + mover.opacityTarget) / d;
				mover.duration--;
			}
			this._regionFillMover = this._regionFillMover.filter(m => m.duration > 0);
			$gameTemp.requestTileFillRefresh();
		}
	};

	//-----------------------------------------------------------------------------
	// Tilemap

	Tilemap.prototype.setMaskData = function(gm) {
		this._maskData = gm;
		if (!this._maskContainer) {
			this.createMaskContainer();
		}
		this.updateMask();
	};

	const _Tilemap_destroy = Tilemap.prototype.destroy;
	Tilemap.prototype.destroy = function() {
		const sprites = [];
		sprites.push(this._upperMaskSprite);
		sprites.push(this._lowerMaskSprite);
		sprites.push(this._upperFillSprite);
		sprites.push(this._lowerFillSprite);
		for (const sprite of sprites) {
			const bitmap = sprite && sprite.bitmap;
			if (bitmap) {
				bitmap.destroy();
			}
		}
		_Tilemap_destroy.call(this);
	};

	Tilemap.prototype.createMaskContainer = function() {
		this._maskContainer = new PIXI.Container();
		this.addChild(this._maskContainer);
		this._maskContainer.z = 10;
	};

	Tilemap.prototype.createUpperMaskSprite = function() {
		this._upperMaskSprite = new Sprite();
		this._maskContainer.addChild(this._upperMaskSprite);
	};

	Tilemap.prototype.createLowerMaskSprite = function() {
		this._lowerMaskSprite = new Sprite();
		this._maskContainer.addChild(this._lowerMaskSprite);
	};

	Tilemap.prototype.createUpperFillSprite = function() {
		this._upperFillSprite = new Sprite();
		this._maskContainer.addChild(this._upperFillSprite);
	};

	Tilemap.prototype.createLowerFillSprite = function() {
		this._lowerFillSprite = new Sprite();
		this.addChild(this._lowerFillSprite);
		this._lowerFillSprite.z = 1.5;
	};

	Tilemap.prototype.setupUpperMaskSprite = function(w, h) {
		const gm = this._maskData;
		if (!this._upperMaskSprite) {
			if (!gm || !gm._upperRegionMaskData || !gm._upperRegionMaskData.length) return;
			this.createUpperMaskSprite();
		}
		const sprite = this._upperMaskSprite;
		if (sprite.bitmap && (sprite.bitmap.width !== w || sprite.bitmap.height !== h)) {
			sprite.bitmap.destroy();
			sprite.bitmap = null;
		}
		if (!sprite.bitmap) {
			sprite.bitmap = new Bitmap(w, h);
		}
		sprite.bitmap.smooth = gm._upperRegionMaskSmooth;
		sprite.bitmap.fillAll("white");
		sprite.scale.x = this.tileWidth;
		sprite.scale.y = this.tileHeight;
		this._upperLayer.mask = sprite;
	};

	Tilemap.prototype.setupLowerMaskSprite = function(w, h) {
		const gm = this._maskData;
		if (!this._lowerMaskSprite) {
			if (!gm || !gm._lowerRegionMaskData || !gm._lowerRegionMaskData.length) return;
			this.createLowerMaskSprite();
		}
		const sprite = this._lowerMaskSprite;
		if (sprite.bitmap && (sprite.bitmap.width !== w || sprite.bitmap.height !== h)) {
			sprite.bitmap.destroy();
			sprite.bitmap = null;
		}
		if (!sprite.bitmap) {
			sprite.bitmap = new Bitmap(w, h);
		}
		sprite.bitmap.smooth = gm._lowerRegionMaskSmooth;
		sprite.bitmap.fillAll("white");
		sprite.scale.x = this.tileWidth;
		sprite.scale.y = this.tileHeight;
		this._lowerLayer.mask = sprite;
	};

	Tilemap.prototype.setupUpperFillSprite = function(w, h) {
		const gm = this._maskData;
		if (!this._upperFillSprite) {
			if (!gm || !gm._upperRegionFillData || !gm._upperRegionFillData.length) return;
			this.createUpperFillSprite();
		}
		const sprite = this._upperFillSprite;
		if (sprite.bitmap && (sprite.bitmap.width !== w || sprite.bitmap.height !== h)) {
			sprite.bitmap.destroy();
			sprite.bitmap = null;
		}
		if (!sprite.bitmap) {
			sprite.bitmap = new Bitmap(w, h);
		}
		sprite.bitmap.smooth = gm._upperRegionFillSmooth;
		sprite.bitmap.clear();
		sprite.scale.x = this.tileWidth;
		sprite.scale.y = this.tileHeight;
		sprite.blendMode = gm._upperRegionFillBlendMode;
	};

	Tilemap.prototype.setupLowerFillSprite = function(w, h) {
		const gm = this._maskData;
		if (!this._lowerFillSprite) {
			if (!gm || !gm._lowerRegionFillData || !gm._lowerRegionFillData.length) return;
			this.createLowerFillSprite();
		}
		const sprite = this._lowerFillSprite;
		if (sprite.bitmap && (sprite.bitmap.width !== w || sprite.bitmap.height !== h)) {
			sprite.bitmap.destroy();
			sprite.bitmap = null;
		}
		if (!sprite.bitmap) {
			sprite.bitmap = new Bitmap(w, h);
		}
		sprite.bitmap.smooth = gm._lowerRegionFillSmooth;
		sprite.bitmap.clear();
		sprite.scale.x = this.tileWidth;
		sprite.scale.y = this.tileHeight;
		sprite.blendMode = gm._lowerRegionFillBlendMode;
	};

	Tilemap.prototype._addAllMasks = function(startX, startY) {
		const widthWithMatgin = this.width + this._margin * 2;
		const heightWithMatgin = this.height + this._margin * 2;
		let tileCols = Math.ceil(widthWithMatgin / this.tileWidth) + 1 ;
		let tileRows = Math.ceil(heightWithMatgin / this.tileHeight) + 1;
		this.setupUpperMaskSprite(tileCols, tileRows);
		this.setupLowerMaskSprite(tileCols, tileRows);
		if (!this._upperMaskSprite && !this._lowerMaskSprite) return;
		for (let y = 0; y < tileRows; y++) {
			for (let x = 0; x < tileCols; x++) {
				this._addUpperMask(startX, startY, x, y);
				this._addLowerMask(startX, startY, x, y);
			}
		}
	};

	Tilemap.prototype._addAllFills = function(startX, startY) {
		const widthWithMatgin = this.width + this._margin * 2;
		const heightWithMatgin = this.height + this._margin * 2;
		let tileCols = Math.ceil(widthWithMatgin / this.tileWidth) + 1;
		let tileRows = Math.ceil(heightWithMatgin / this.tileHeight) + 1;
		this.setupUpperFillSprite(tileCols, tileRows);
		this.setupLowerFillSprite(tileCols, tileRows);
		if (!this._upperFillSprite && !this._lowerFillSprite) return;
		for (let y = 0; y < tileRows; y++) {
			for (let x = 0; x < tileCols; x++) {
				this._addUpperFill(startX, startY, x, y);
				this._addLowerFill(startX, startY, x, y);
			}
		}
	};

	Tilemap.prototype._addUpperMask = function(startX, startY, x, y) {
		if (!this._upperMaskSprite) return;
		const mx = startX + x;
		const my = startY + y;
		const regionId = this._readMaskRegionData(mx, my, 1);
		const opacity = this._maskData._upperRegionMaskData[regionId] ?? 255;
		if (opacity < 255) {
			const bitmap = this._upperMaskSprite.bitmap;
			const color = `rgb(${opacity},${opacity},${opacity})`;
			bitmap.fillRect(x, y, 1, 1, color);
		}
	};

	Tilemap.prototype._addLowerMask = function(startX, startY, x, y) {
		if (!this._lowerMaskSprite) return;
		const mx = startX + x;
		const my = startY + y;
		const regionId = this._readMaskRegionData(mx, my, 0);
		const opacity = this._maskData._lowerRegionMaskData[regionId] ?? 255;
		if (opacity < 255) {
			const bitmap = this._lowerMaskSprite.bitmap;
			const color = `rgb(${opacity},${opacity},${opacity})`;
			bitmap.fillRect(x, y, 1, 1, color);
		}
	};

	Tilemap.prototype._addUpperFill = function(startX, startY, x, y) {
		if (!this._upperFillSprite) return;
		const mx = startX + x;
		const my = startY + y;
		const regionId = this._readFillRegionData(mx, my, 1);
		const opacity = this._maskData._upperRegionFillData[regionId] ?? 0;
		if (opacity > 0) {
			const bitmap = this._upperFillSprite.bitmap;
			const color = `rgba(${this._maskData._upperRegionFillColor[regionId] ?? upperFillColor},${opacity/255})`;
			bitmap.fillRect(x, y, 1, 1, color);
		}
	};

	Tilemap.prototype._addLowerFill = function(startX, startY, x, y) {
		if (!this._lowerFillSprite) return;
		const mx = startX + x;
		const my = startY + y;
		const regionId = this._readFillRegionData(mx, my, 0);
		const opacity = this._maskData._lowerRegionFillData[regionId] ?? 0;
		if (opacity > 0) {
			const bitmap = this._lowerFillSprite.bitmap;
			const color = `rgba(${this._maskData._lowerRegionFillColor[regionId] ?? lowerFillColor},${opacity/255})`;
			bitmap.fillRect(x, y, 1, 1, color);
		}
	};

	const _Tilemap_updateTransform = Tilemap.prototype.updateTransform;
	Tilemap.prototype.updateTransform = function() {
		this.updateMask();
		_Tilemap_updateTransform.call(this);
	};

	Tilemap.prototype.updateMask = function() {
		if (this._maskContainer) {
			const ox = Math.ceil(this.origin.x);
			const oy = Math.ceil(this.origin.y);
			const startX = Math.floor((ox - this._margin) / this.tileWidth);
			const startY = Math.floor((oy - this._margin) / this.tileHeight);
			const x = startX * this.tileWidth - ox;
			const y = startY * this.tileHeight - oy
			this._maskContainer.x = x;
			this._maskContainer.y = y;
			if (this._lowerFillSprite) {
				this._lowerFillSprite.x = x;
				this._lowerFillSprite.y = y;
			}
			const needsRepaint = this._needsRepaint || this._lastStartX !== startX || this._lastStartY !== startY;
			if (needsRepaint || $gameTemp.isTileMaskRefreshRequested()) {
				this._addAllMasks(startX, startY);
				$gameTemp.clearTileMaskRefreshRequest();
			}
			if (needsRepaint || $gameTemp.isTileFillRefreshRequested()) {
				this._addAllFills(startX, startY);
				$gameTemp.clearTileFillRefreshRequest();
			}
		}
	};

	Tilemap.prototype._readMaskRegionData = function(x, y, z) {
		const regionData = this._maskData._maskTileRegionData;
		let regionId = -1;
		if (considerMapEdges) {
			if (!this.horizontalWrap) {
				if (x < 0) {
					x++;
				} else if (x >= this._mapWidth) {
					x--;
				}
			}
			if (!this.verticalWrap) {
				if (y < 0) {
					y++;
				} else if (y >= this._mapHeight) {
					y--;
				}
			}
		}
		if (regionData && regionData.length) {
			const width = this._mapWidth;
			const height = this._mapHeight;
			if (this.horizontalWrap) {
				x = x.mod(width);
			}
			if (this.verticalWrap) {
				y = y.mod(height);
			}
			if (x >= 0 && x < width && y >= 0 && y < height) {
				regionId = regionData[(z * height + y) * width + x] ?? -1;
			}
		}
		return regionId > -1 ? regionId : this._readMapData(x, y, 5);
	};

	Tilemap.prototype._readFillRegionData = function(x, y, z) {
		const regionData = this._maskData._fillTileRegionData;
		let regionId = -1;
		if (considerMapEdges) {
			if (!this.horizontalWrap) {
				if (x < 0) {
					x++;
				} else if (x >= this._mapWidth) {
					x--;
				}
			}
			if (!this.verticalWrap) {
				if (y < 0) {
					y++;
				} else if (y >= this._mapHeight) {
					y--;
				}
			}
		}
		if (regionData && regionData.length) {
			const width = this._mapWidth;
			const height = this._mapHeight;
			if (this.horizontalWrap) {
				x = x.mod(width);
			}
			if (this.verticalWrap) {
				y = y.mod(height);
			}
			if (x >= 0 && x < width && y >= 0 && y < height) {
				regionId = regionData[(z * height + y) * width + x] ?? -1;
			}
		}
		return regionId > -1 ? regionId : this._readMapData(x, y, 5);
	};

	//-----------------------------------------------------------------------------
	// Spriteset_Map

	const _Spriteset_Map_createTilemap = Spriteset_Map.prototype.createTilemap;
	Spriteset_Map.prototype.createTilemap = function() {
		_Spriteset_Map_createTilemap.call(this);
		this._tilemap.setMaskData($gameMap);
	};

	//-----------------------------------------------------------------------------
	// Game_CharacterBase

	const _Game_CharacterBase_initialize = Game_CharacterBase.prototype.initialize;
	Game_CharacterBase.prototype.initialize = function() {
		_Game_CharacterBase_initialize.call(this);
		this._tileMaskId = -1
		this._tileMaskMode = maskMode;
		this._tileMaskRatio = 1;
	};

	Game_CharacterBase.prototype.tileMaskId = function() {
		return this._tileMaskId ?? -1;
	};

	Game_CharacterBase.prototype.tileMaskMode = function() {
		return this._tileMaskMode ?? maskMode;
	};

	Game_CharacterBase.prototype.tileMaskRatio = function() {
		return this._tileMaskRatio ?? 1;
	};

	Game_CharacterBase.prototype.setTileMaskId = function(id) {
		this._tileMaskId = id;
	};

	Game_CharacterBase.prototype.setTileMaskMode = function(mode) {
		this._tileMaskMode = mode;
	};

	Game_CharacterBase.prototype.setTileMaskRatio = function(ratio) {
		this._tileMaskRatio = ratio;
	};

	Game_CharacterBase.prototype.tileMaskOpacity = function() {
		const mode = this.tileMaskMode();
		if (mode < 0 && this.isNormalPriority() && !this._higher) {
			return 255;
		}
		let z = mode;
		if (z < 0) {
			z = this._priorityType > 0 ? 1 : 0;
		}
		let maskId = this.tileMaskId();
		let ratio = this.tileMaskRatio();
		if (maskId < 0) {
			maskId = $gameMap.regionMaskId(this.x, this.y, z);
		}
		return $gameMap.regionMaskOpacity(maskId, z) * ratio + (255 - ratio * 255);
	};

	Game_CharacterBase.prototype.tileMaskRatioForEffects = function() {
		if (this.isOnOverPath && this.isOnOverPath() && (!this.isHigherPriority() || this._priorityType > 1)) {
			let maskId = this.tileMaskId();
			if (maskId < 0) {
				maskId = $gameMap.regionMaskId(this.x, this.y, 1);
			}
			const upperOpacity = $gameMap.regionMaskOpacity(maskId, 1);
			return (255 - upperOpacity)/255;
		}
		return 1;
	};

	//-----------------------------------------------------------------------------
	// Game_Follower

	const _Game_Follower_update = Game_Follower.prototype.update;
	Game_Follower.prototype.update = function() {
		_Game_Follower_update.call(this);
		this.setTileMaskId($gamePlayer.tileMaskId());
		this.setTileMaskMode($gamePlayer.tileMaskMode());
		this.setTileMaskRatio($gamePlayer.tileMaskRatio());
	};

	//-----------------------------------------------------------------------------
	// Game_Event

	const _Game_Event_initialize = Game_Event.prototype.initialize;
	Game_Event.prototype.initialize = function(mapId, eventId) {
		_Game_Event_initialize.call(this, mapId, eventId);
		const data = this.event();
		if (!data.meta) return;
		const tileRatio = data.meta.tileMaskRatio;
		if (tileRatio) {
			this._tileMaskRatio = Number(tileRatio);
		}
		const tileMask = data.meta.tileMask;
		if (!tileMask) return;
		switch (tileMask) {
		case true:
			this._tileMaskMode = -1;
			return;
		case "false":
			this._tileMaskMode = -2;
			return;
		}
		const params = String(tileMask);
		if (params.includes("upper")) {
			this._tileMaskMode = 1;
		} else if (params.includes("lower")) {
			this._tileMaskMode = 0;
		} else {
			this._tileMaskMode = -1;
		}
		const maskId = parseInt(params);
		this._tileMaskId = maskId >= 0 ? maskId : -1;
	};

	//-----------------------------------------------------------------------------
	// Sprite_Character

	const _Sprite_Character_updateOther = Sprite_Character.prototype.updateOther;
	Sprite_Character.prototype.updateOther = function() {
		_Sprite_Character_updateOther.call(this);
		const maskMode = this._character.tileMaskMode();
		this._maskOpacity = 255;
		if (maskMode > -2) {
			this._maskOpacity = this._character.tileMaskOpacity();
			this.opacity *= this._maskOpacity / 255;
		}
	};

	//-----------------------------------------------------------------------------
	// Sprite_Balloon

	if (maskBalloon) {
		const _Sprite_Balloon_update = Sprite_Balloon.prototype.update;
		Sprite_Balloon.prototype.update = function() {
			_Sprite_Balloon_update.call(this);
			if (this._target._maskOpacity != null) {
				this.opacity = this._target._maskOpacity;
				const character = this._target._character;
				this.opacity *= character.tileMaskRatioForEffects();
			}
		};
	}
}