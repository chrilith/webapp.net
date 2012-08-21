
(function() {

	var all  = document.getElementsByTagName('script'),
		path = all[all.length - 1].src,
		dir	 = path.substr(0, path.indexOf("webapp.debug.js"));
	
	document.write(' \
		<script src="' + dir + '../Extensions/CoreHookManager/CoreHookManager.js"></script> \
		<script src="' + dir + '../Extensions/CoreNavigationManager/CoreNavigationManager.js"></script> \
		<script src="' + dir + '../Extensions/CoreEventManager/CoreEventManager.js"></script> \
		<script src="' + dir + '../Extensions/CoreLoaderAnimator/CoreLoaderAnimator.js"></script> \
		<script src="' + dir + '../Extensions/CoreContentRequester/CoreContentRequester.js"></script> \
		<script src="' + dir + '../Extensions/CoreProgressiveImageLoading/CoreProgressiveImageLoading.js"></script> \
		<script src="' + dir + '../Extensions/CoreUIMoreButton/CoreUIMoreButton.js"></script> \
		<script src="' + dir + '../Extensions/CoreUIRadioList/CoreUIRadioList.js"></script> \
		<script src="' + dir + '../Extensions/CoreUISwitchButton/CoreUISwitchButton.js"></script> \
		<script src="' + dir + '../Extensions/CoreURLManager/CoreURLManager.js"></script> \
	');

})();
