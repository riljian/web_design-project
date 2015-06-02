<?php

include 'conf.php';

$db = "game";

$name = $_GET["name"];
$score = $_GET["score"];

$link = mysql_connect($host, $user, $pwd) or die("Failed to connect!");
mysql_select_db($db, $link) or die("Failed to select database!");
mysql_set_charset("utf8", $link);


$sql = "INSERT INTO student (name, score) VALUES ('$name', $score) ON DUPLICATE KEY UPDATE score=$score";
mysql_query($sql, $link);

$sql = "SELECT * FROM student ORDER BY student.score DESC LIMIT 0, 20";
$dataFetch = mysql_query($sql, $link);

echo "<tr><th>#</th><th>姓名</th><th>分數</th></tr>";

$i = 1;
while ($rowsOfData = mysql_fetch_row($dataFetch)) {
    echo "<tr><th>".$i."</th><td>".$rowsOfData[0]."</td><td>".$rowsOfData[1]."</td></tr>";
    $i++;
}

?>
