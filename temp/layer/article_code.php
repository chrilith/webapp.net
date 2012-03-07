<?php
################################################################################
################################################################################
# params

$id = $_GET["id"];

# Not used here: let you know that the request must be considered as an
# asynchronous request and render a XML content instead of XHTML

$async = ($_GET["__async"] == "true");

################################################################################
# Requested data

function Data() {
	global $id;

	return array(	"title" => "USA States $id",
					"content" => "This is a demonstration application showing WebApp.Net capabilities. Use this sample webapp to build your own iPhone/iPod Touch web applications.",
					"image" => "image.png" );
}
################################################################################
# Rendering

function Draw() {
	$data = Data();

?>	<div class="iBlock" style="height:500px">
		<h1><?php echo $data["title"] ?></h1>
		<p><img src="Img/<?php echo $data["image"] ?>" style="float:left;margin:0 5px" width="50" height="50" /><?php echo $data["content"] ?></p>
	</div>
	test
<?php }
################################################################################
################################################################################
?>