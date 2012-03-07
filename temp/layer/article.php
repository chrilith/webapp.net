<?php
	include "article_code.php";
	header("Content-type: text/xml");
################################################################################
################################################################################
?><root>
	<part>
		<destination mode="replace" zone="waArticle" create="true" />
		<data><![CDATA[ <?php echo Draw() ?> ]]></data>
	</part>
</root>
