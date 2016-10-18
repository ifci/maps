"use strict";
var vm = new Vue({
	el: '#app',
	data: {
		list: false,
		gender: {
			'男': '',
			'女': ''
		},
		genderTabs: '',
		labelTabs: '',
		tags: [],
		mapShow: false,
		pointStr: getUrlParam('gps') || '121.541232,31.223957',
		point: {},
		page: 0,
		totalPage: 0,
		nearby: {},
		pPoint: '',
		sPoint: '',
		searchStatus: false,
		keyWords: '',
		searchResults: [],
		repeat: true
	},
	methods: {
		getList: function() {	// 获取房间列表
			var _self = this;
			if (_self.page === 0) {
				_self.list = false;
			}
			fetch({
				url: 'http://app.bankuang.com/api/index.php',
				type: "get",
				data: {
					url: 'http://121.199.9.127:7001/api/nearby?gps=' + this.pointStr + '&gender=' + this.genderTabs + '&tabs=' + this.labelTabs + '&p=' + this.page
				},
				dataType: "json",
				success: function (response) {
					_self.totalPage = Math.ceil(response.Data.OutPut.TotalCount / 20);
					var gender = response.Data.OutPut.Filters[0].gender;
					if (gender.length > 0) {
						gender.forEach(function(v) {
							if (v[0] === '男' && v[1]) {
								_self.gender['男'] = v[1];
							} else if (v[0] === '女' && v[1]) {
								_self.gender['女'] = v[1];
							}
						});
					} else {
						_self.gender['男'] = 0;
						_self.gender['女'] = 0;
					}
					_self.tags = response.Data.OutPut.LabelList;
					/*var list = [];
					response.Data.OutPut.RoomList.forEach(function(v, k) {
						list.push(JSON.parse(v.content));
						list[k].dist = v.dist;
					});*/
					if (_self.page === 0) {
						_self.list = [];
					}
					_self.list = _self.list.concat(response.Data.OutPut.RoomList);
		            document.querySelector('.retable-more').innerText = '上拉显示更多';
				}
			});
			/*fetch({
				url: 'http://114.55.173.1:5666/nearby',
				type: "get",
				data: {
					latlon: this.pointStr,
					gender: this.genderTabs,
					tabs: this.labelTabs,
					p: this.page
				},
				dataType: "json",
				success: function (response) {
					_self.totalPage = Math.ceil(response.numFound / 20);
					var gender = response.filters[0].gender;
					if (gender.length > 0) {
						response.filters[0].gender.forEach(function(v, k) {
							if (v[0] === '男') {
								_self.gender['男'] = v[1];
							} else if (v[0] === '女') {
								_self.gender['女'] = v[1];
							}
						});
					} else {
						_self.gender['男'] = 0;
						_self.gender['女'] = 0;
					}
					// _self.gender = {
					// '男': response.filters[0].gender[1][1],
					// '女': response.filters[0].gender[0][1]
					// }
					// _self.tags = response.filters[1].tags;
					var list = [];
					response.docs.forEach(function(v, k) {
						list.push(JSON.parse(v.content));
						list[k].dist = v.dist;
					});
					_self.list = _self.list.concat(list);
					console.log(_self.list);
				}
			});*/
		},
		maps: function() {
			this.mapShow = !this.mapShow;
			this.page = 0;
			this.$nextTick(function() {
				var $allmap = document.querySelector('#allmap');
				if (!$allmap.style.display && $allmap.innerHTML === '') {
					loadJScript();
				}
			});
		},
		closeMaps: function() {
			this.mapShow = false;
			this.searchStatus = false;
		},
		getPoint: function() {
			// this.pointStr = lat + ',' + lng;
			if (this.searchStatus) {
				this.search();
				return;
			}
			this.list = [];
			this.getList();
			this.mapShow = false;
		},
		chooseGender: function(m) {
			if (m !== this.genderTabs) {
				this.list = [];
				this.page = 0;
				this.genderTabs = m;
				this.getList();
			}
		},
		chooseLabel: function(m) {
			if (m !== this.labelTabs) {
				this.list = [];
				this.page = 0;
				this.labelTabs = m;
				this.getList();
			}
		},
		nextPage: function() {
			this.page++;
			this.getList();
		},
		panto: function(pt) {
			panto(pt);
		},
		searchShow: function() {
			this.searchStatus = true;
		},
		search: function() {
			var _self = this;
			_self.searchResults = false;
			fetch({
				url: 'http://app.bankuang.com/api/index.php',
				type: "get",
				data: {
					url: 'http://api.map.baidu.com/place/v2/search?query=' + this.keyWords + '&location=31.223374,121.54069&radius=2000&output=json&ak=EGc4m9P9FUNEWC27xKgf9kO1TNboRCay'
				},
				dataType: "json",
				success: function (response) {
					_self.searchResults = response.results;
					if (_self.searchResults && _self.searchResults.length > 0) {
						var location = _self.searchResults[0].location;
						_self.sPoint = location.lng + ',' + location.lat;
					}
				}
			});
			/*fetch({
				url: 'http://api.map.baidu.com/place/v2/search',
				type: "get",
				data: {
					query: this.keyWords,
					location: '31.223374,121.54069',
					radius: '2000',
					output: 'json',
					ak: 'EGc4m9P9FUNEWC27xKgf9kO1TNboRCay'
				},
				dataType: "json",
				success: function (response) {
					_self.searchResults = response.results;
					var location = _self.searchResults[0].location;
					_self.sPoint = location.lng + ',' + location.lat;
				}
			});*/
		},
		searchNear: function(pt) {
			searchNear(pt);
		},
		scroll: function () {
	        if (document.documentElement.scrollHeight - document.body.scrollTop <= document.documentElement.clientHeight && this.repeat) {
	          	this.repeat = false;
	          	document.querySelector('.retable-more').innerText = '正在加载...';
	          	var _self = this;
	          	setTimeout(function () {
		            _self.page ++;
					_self.getList();
		            _self.repeat = true;
	          	}, 800);
	        }
      	}
	},
	ready: function() {
		this.getList();
		var pointArr = this.pointStr.split(',');
		this.point = {x: pointArr[0], y: pointArr[1]};
		window.getPoint = this.getPoint;
		// this.maps();
		var _self = this;
		var x = 0, y = 0;

      	window.onscroll = function() {
	        _self.scroll();
      	};
		/*fetch({
			url: 'http://app.bankuang.com/api/index.php?url=' + encodeURIComponent('https://api.map.baidu.com/highacciploc/v1?qcip=' + returnCitySN.cip + '&qterm=pc&ak=EGc4m9P9FUNEWC27xKgf9kO1TNboRCay&coord=bd09ll'),
			type: "get",
			dataType: "json",
			success: function (response) {
		      	x = response.content.location.lng;
				y = response.content.location.lat;
				_self.pointStr = x + ',' + y;
			}
		});*/
		/*fetch('http://app.bankuang.com/api/index.php?url=' + encodeURIComponent('https://api.map.baidu.com/location/ip?ak=EGc4m9P9FUNEWC27xKgf9kO1TNboRCay&coor=bd09ll')).then(function (res) {
				return res.json();
			}).then(function (res) {
				alert(1);
				alert(res.content.point.x + ' - ' + res.content.point.y);
			});*/
		/*window.onload = function() {
			if(navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function (position){
			      	y = position.coords.latitude;
			      	x = position.coords.longitude;
					_self.pointStr = x + ',' + y;
					alert(_self.pointStr);
			    }, function(err) {
			    	console.log(err);
			    }, {
			        // 指示浏览器获取高精度的位置，默认为false
			        enableHighAccuracy: true
			    });
			}
		}*/

		window.loadJScript = function() {
			var map = new BMap.Map("allmap");

            // alert(x + ' - ' + y)
			map.centerAndZoom(new BMap.Point(_self.point.x, _self.point.y), 18);
			map.addControl(new BMap.ZoomControl());
			function addMarker (point) {
				var marker1 = new BMap.Marker(new BMap.Point(point[0], point[1]));
				map.addOverlay(marker1);
			}
			var gc = new BMap.Geocoder();
			// addMarker([121.54069, 31.223374]);

			/* var local = new BMap.LocalSearch(map, {
			 renderOptions:{map: map}
			 });
			 local.search("景点");
			 local.setSearchCompleteCallback(function(rs) {
			 console.info(rs);
			 }); */



			/*var cp = map.getCenter();
			gc.getLocation(cp, function(rs){
				_self.nearby = {
					address: rs.address,
					list: rs.surroundingPois,
					point: cp
				};
			}, {
				poiRadius: 2000
			});*/
			window.panto = function(pt) {
				if (pt) {
					_self.pPoint = pt.lng + ',' + pt.lat;
				} else {
					_self.pPoint = '';
					pt = _self.nearby.point;
				}
				map.panTo(new BMap.Point(pt.lng, pt.lat));
			};
			window.searchNear = function(pt) {
				_self.sPoint = pt ? pt.lng + ',' + pt.lat : '';
				_self.searchStatus = false;
				_self.pPoint = '';
				var point = new BMap.Point(pt.lng, pt.lat);
				map.panTo(point);
				showInfo(point);
			};
			function showInfo(cp) {
				if (!cp || !cp.lng) {
					cp = map.getCenter();
				}
				_self.pointStr = cp.lng + ',' + cp.lat;
				gc.getLocation(cp, function(rs){
					// console.info(rs.getNumPages());
					_self.nearby = {
						address: rs.address,
						list: rs.surroundingPois,
						point: rs.point
					};
				}, {
					poiRadius: 2000,
					numPois : 1000
				})
			}
			showInfo();
			map.addEventListener("touchend", showInfo);
		};
// loadJScript ();
	}
});