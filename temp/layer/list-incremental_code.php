<?php
################################################################################
################################################################################
# params

# Not used here: let you know that the request must be considered as an
# asynchronous request and render a XML content instead of XHTML (more
# information about this will be available with the WebApp PHP framework)

$async = ($_GET["__async"] == "true");

################################################################################
# Requested data

function Data() {
	return array(
		array("id" =>  1, "state" => "AL", "title" => "Alabama", "desc" => "Population: 4,627,851 - Capital: Montgomery"),
		array("id" =>  2, "state" => "AK", "title" => "Alasaka", "desc" => "Population: 683,478 - Capital: Juneau"),
		array("id" =>  3, "state" => "AZ", "title" => "Arizona", "desc" => "Population: 6,338,755 - Capital: Phoenix"),
		array("id" =>  4, "state" => "AR", "title" => "Arkhansas", "desc" => "Population: 2,834,797 - Capital: Little Rock"),
		array("id" =>  5, "state" => "CA", "title" => "California", "desc" => "Population: 36,553,215 - Capital: Sacramento"),
		array("id" =>  6, "state" => "CO", "title" => "Colorado", "desc" => "Population: 4,861,515 - Capital: Denver"),
		array("id" =>  7, "state" => "CT", "title" => "Connecticut", "desc" => "Population: 3,502,309 - Capital: Hartford"),
		array("id" =>  8, "state" => "DE", "title" => "Delaware", "desc" => "Population: 864,764 - Capital: Dover"),
		array("id" =>  9, "state" => "FL", "title" => "Florida", "desc" => "Population: 18,251,243 - Capital: Tallahassee"),
		array("id" => 10, "state" => "GA", "title" => "Goergia", "desc" => "Population: 9,544,750 - Capital: Atlanta"),
		array("id" => 11, "state" => "HI", "title" => "Hawaii", "desc" => "Population: 1,283,388 - Capital: Honolulu"),
		array("id" => 12, "state" => "ID", "title" => "Idhao", "desc" => "Population: 1,499,402 - Capital: Boise")
	);
}
################################################################################
# Rendering
$page = max($_GET["page"], 1);
$mode = $page == 1 ? "replace" : "self";
$zone = $page == 1 ? "waIncremental" : "more";

function Draw() {
	global $page, $zone;

	$data = Data();
	$len  = count($data);
	$pos  = ($page - 1) * 5;
	$last = min($pos + 5, $len);
	$old  = substr($data[$pos - 1]["title"], 0, 1);
	if (!$old) $old = 'A';

	if ($zone != "more") {
		echo '<div class="iList">
				<h2>A</h2>
				<ul class="iArrow">';
	}

	for ($i = $pos; $i < $last; $i++) {

		$cur = substr($data[$i]["title"], 0, 1);
		if ($old != $cur) {
			$old = $cur;
			echo '</ul><h2>' .$cur. '</h2><ul class="iArrow">';
		}

?>		<li><a href="Layer/Article.php?zone=article&amp;id=<?php echo $data[$i]["id"] ?>#_Article" rev="async">
			<em><?php echo $data[$i]["title"] ?></em>
			<small><?php echo $data[$i]["desc"] ?></small>
		</a></li>
<?php
	}
	if ($last < $len) { ?>
		<li id="more" class="iMore"><a href="Layer/list-incremental.php?page=<?php echo $page + 1; ?>" rev="async" title="Loading items..."><span><?php echo min($len - $last, 5); ?> next items...</span></a></li>
<?php
	}

	if ($zone != 'more') {
		echo '	</ul>
			</div>';
	}
}
################################################################################
################################################################################
?>