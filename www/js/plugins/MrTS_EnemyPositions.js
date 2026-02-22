//=============================================================================
// MrTS_EnemyPositions.js
//=============================================================================

/*:
* @plugindesc MrTS标签改变敌人位置[v1.1]
* @author Mr. Trivel
*
* @param Spawn Rule
* @type boolean
* @on 是
* @off 否
* @text 生成规则
* @desc 当没有可用位置时，重复位置的敌人不会生成
* @default true
* 
* @help 
* --------------------------------------------------------------------------------
* 使用条款
* --------------------------------------------------------------------------------
* 不要移除头部信息或声称此插件由你编写
* 在项目中使用此插件时，请注明Mr. Trivel
* 商业和非商业项目均可免费使用
* --------------------------------------------------------------------------------
* 版本 1.1
* --------------------------------------------------------------------------------
*
  敌人位置设置：
在数据库的敌人编辑界面，在备注栏中添加位置标签
标签格式：<Position: X坐标 Y坐标>（例如<Position: 300 250>）
可添加多个标签（每行一个），战斗时会从中随机选择一个位置

  示例：
<Position: 400 300>
<Position: 500 350>
<Position: 600 300>
敌人会随机出现在 (400,300)、(500,350)、(600,300) 这三个位置中的一个
特殊说明：
不添加标签的敌人会按默认规则生成位置
与 Hime 的 Enemy Reinforcements（敌人增援）插件兼容，增援的敌人也会遵循位置设置

* --------------------------------------------------------------------------------
* 敌人标签
* --------------------------------------------------------------------------------
* 在敌人的备注栏中使用以下标签。如果有多个标签，将随机选择一个。
* <Position: [X] [Y]>
* 例如：
<Position: 500 200>
* --------------------------------------------------------------------------------
* 版本历史
* --------------------------------------------------------------------------------
* 1.0 - 发布
* 1.1 - 现在与Hime的敌人增援插件兼容
*/

(function() {
	var parameters = PluginManager.parameters('MrTS_EnemyPositions');
	var paramSpawnRule = String(parameters['Spawn Rule'] || "true");
	paramSpawnRule = Boolean(paramSpawnRule.toLowerCase() === "true")

	var _GameTroop_setup = Game_Troop.prototype.setup;
	Game_Troop.prototype.setup = function(troopId) {
		_GameTroop_setup.call(this, troopId);
		this.reshuffleEnemies();
	};

	Game_Troop.prototype.randomiseEnemyPosition = function(index) {
		var enemy = this._enemies[index].enemy();
		if (enemy.meta.Position)
		{
			this._enemies[index]._screenX = -100;
			this._enemies[index]._screenY = -100;
			var note = enemy.note.split(/[\r\n]/);
			var positions = [];
			var lastPosition = [];
			var regex = /<Position:[ ]*(.*)>/;
			for (var j = 0; j < note.length; j++)
			{
				var regexMatch = regex.exec(note[j]);
				if (regexMatch)
					positions.push(regexMatch[1]);
			};

				var l = positions.length;
			for (var j = 0; j < l; j++)
			{
				var newPosition = positions[Math.floor(Math.random()*positions.length)];
				var newCoordinates = newPosition.split(' ');
				lastPosition = newCoordinates;
				var newX = Number(newCoordinates[0]);
				var newY = Number(newCoordinates[1]);
				if (this.enemyExistsAtPos(newX, newY))
				{
					positions.splice(positions.indexOf(newPosition), 1);
				}
				else
				{
					this._enemies[index]._screenX = newX;
					this._enemies[index]._screenY = newY;
					break;
				}
			};

			if (positions.length === 0)
			{
				if (paramSpawnRule)
				{
					this._enemies.splice(index, 1);
					index--;
				}
				else
				{
					var newX = Number(lastPosition[0]);
					var newY = Number(lastPosition[1]);
					this._enemies[index]._screenX = newX;
					this._enemies[index]._screenY = newY; 
				}
			}
		}
	};

	Game_Troop.prototype.reshuffleEnemies = function() {
		this.resetEnemyPositionsSpecial();

		for (var i = this._enemies.length - 1; i >= 0; i--) {
			this.randomiseEnemyPosition(i);
		};

		this.makeUniqueNames();
	};

	Game_Troop.prototype.enemyExistsAtPos = function(x, y) {
		for (var i = 0; i < this._enemies.length; i++) {
			if (this._enemies[i].screenX() === x && this._enemies[i].screenY() === y)
				return true;
		};

		return false;
	};

	Game_Troop.prototype.resetEnemyPositionsSpecial = function() {
		for (var i = 0; i < this._enemies.length; i++) {
			if (!this._enemies[i].enemy().meta.Position) continue;
			this._enemies[i]._screenX = -100;
			this._enemies[i]._screenY = -100;
		};
	};

	if (Imported.EnemyReinforcements)
	{
		var _GameTroop_addReinforcementMember = Game_Troop.prototype.addReinforcementMember;
		Game_Troop.prototype.addReinforcementMember = function(troopId, memberId, member) {    
		    _GameTroop_addReinforcementMember.call(this, troopId, memberId, member);
		    this.randomiseEnemyPosition(this._enemies.length-1);
		}
	}
})();
