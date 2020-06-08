define(['jquery'], function($){
	var VideoPlayer = function(opts){
    this.init(opts)
  };

	VideoPlayer.prototype = {
    init(opts) {
      console.log(opts)
			this.initFrame(opts)
    },
		initFrame({top, left, width, height, src, container}) {
			var frameId = 'video-player' + new Date().getTime();
			var dom = `<div id='${frameId}'>
			<style>
				#${frameId} {position: absolute;left: ${left}px; top: ${top}px;width: ${width}px;height: ${height}px;}
				#${frameId}.max {position: fixed;top: 0px;left: 0px;width: 100%;height: 100%;z-index: 9998;background-color: rgba(0, 0, 0, 0.7);}
				#${frameId} video {height: 100%;width: 100%;z-index: 9999;}
				#${frameId} .mask{position: absolute;bottom: 0;height: ${height / 4}px;left: 0;right: 0;background-color: #000;}
				#${frameId} .slide{ width: 200px;position: relative;height: 4px;background-color: blue;}
				#${frameId} div[name=point] {width: 10px;height: 10px;position: absolute;top: -3px;left: -5px;background-color: red;border-radius: 10px;cursor: pointer;}
			</style>
				<video src='${src}'/>
				<div class='mask'>
						<div name='play' style='color: #fff'>play</div>
						<div name='max' style='color: #fff'>max</div>
						<div name='min' style='color: #fff'>min</div>
						<div class='slide'>
							<div name='point'></div>
						</div>
				</div>
			</div>`
			$(dom).appendTo($(container))
			this.bindEvents(frameId);
		},
		bindEvents(id) {
			$('#' + id)
			.on('click', '[name=play]', ({currentTarget, target}) => {
				if (currentTarget == target) {
					window.player = $('#' + id).find('video')[0]
					if (player.paused) {
						player.play()
					} else {
						player.pause();
					}
				}
			})
			.on('click', '[name=max]', ({currentTarget, target}) => {
				if (currentTarget == target) {
					$('#' + id).addClass('max')
				}
			})
			.on('click', '[name=min]', ({currentTarget, target}) => {
				if (currentTarget == target) {
					$('#' + id).removeClass('max')
				}
			})
			.on('mousedown', '[name=point]', ({currentTarget, target, pageX}) => {
				if (currentTarget == target) {
					var left = parseInt($(currentTarget).css('left'));
					$(document.body).bind('mouseup', () => {
						$(document.body).unbind('mousemove').unbind('mouseup')
					}).bind('mousemove', (e) => {
						var offset = e.pageX - pageX
						var move = left + offset;
						if (move < $(currentTarget).width() / 2) {
							move = 0
						}
						if (move > $(currentTarget).parent().width()) {
							move = $(currentTarget).parent().width()
						}
						$(currentTarget).css({
							left: move
						})
						var video_len = $(currentTarget).parent().width();
						var position = $(currentTarget).offset().left - $(currentTarget).parent().offset().left
						var percentage = position / video_len;

						var player = $('#' + id).find('video')[0]
						player.currentTime = player.duration * percentage;
					})
				}
			})
			.on('timeupdate', 'video', () => {
				var player = $('#'+id).find('video')[0]
				console.log('播放时间：' + player.currentTime);
			})
			$('#'+id).find('video')[0].addEventListener('timeupdate',function() {
				var player = $('#'+id).find('video')[0]
				var left = player.currentTime / player.duration * $('#' + id).find('.slide').width() - $('#' + id).find('[name=point]').width() / 2;
				$('#' + id).find('[name=point]').css({
					left: left
				})
			}, false)
		}
	};

	return VideoPlayer;
});
