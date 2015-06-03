<?php

include 'conf.php';

$db = "game";

$sound = array("ㄅ", "ㄆ", "ㄇ", "ㄈ", "ㄉ", "ㄊ", "ㄋ", "ㄌ", "ㄍ", "ㄎ", "ㄏ", "ㄐ", "ㄑ", "ㄒ", "ㄓ", "ㄔ", "ㄕ", "ㄖ", "ㄗ", "ㄘ", "ㄙ", "ㄧ", "ㄨ", "ㄩ");
$rhyme = array("ㄧ", "ㄨ", "ㄩ", "ㄚ", "ㄛ", "ㄜ", "ㄝ", "ㄞ", "ㄟ", "ㄠ", "ㄡ", "ㄢ", "ㄣ", "ㄤ", "ㄥ");
$rows = $_GET["rows"];
$columns = $_GET["columns"];

$letterString = "";
$phoneticsString = "";

$link = mysql_connect($host, $user, $pwd) or die("Failed to connect!");
mysql_select_db($db, $link) or die("Failed to select database!");
mysql_set_charset("utf8", $link);

for ($i = 0; $i < ($columns * $rows); $i += 2) {
    if ($_GET["mode"] === "sound") {
        $sql = "SELECT letter, sound FROM phonetics_table WHERE sound LIKE '".$sound[rand(0, count($sound) - 1)]."' ORDER BY RAND() LIMIT 0, 2";
    } else {
        $sql = "SELECT letter, rhyme FROM phonetics_table WHERE rhyme LIKE '".$rhyme[rand(0, count($rhyme) - 1)]."' ORDER BY RAND() LIMIT 0, 2";
    }
    $dataFetch = mysql_query($sql, $link);
    $rowsOfData = mysql_num_rows($dataFetch);
    for ($j = 0; $j < $rowsOfData; $j++) {
        $result = mysql_fetch_row($dataFetch);
        $letterString .= $result[0];
        $phoneticsString .= $result[1];
    }
}

for ($i = 0; $i < $rows; $i++) {
    for ($j = 0; $j < $columns; $j++) {
        $map[$i][$j] = -1;
    }
}

generateMap();

for ($i = 0; $i < $rows; $i++) {
    for ($j = 0; $j < $columns; $j++) {
        echo substr($letterString, ($map[$i][$j] - 1) * 3, 3);
    }
}


for ($i = 0; $i < $rows; $i++) {
    for ($j = 0; $j < $columns; $j++) {
        echo substr($phoneticsString, ($map[$i][$j] - 1) * 3, 3);
    }
}

function generateMap() {
    global $rows, $columns, $map;
    $i = 0;
    while ($i < ($rows * $columns)) {
        do {
            $sx = rand(0, $columns - 1);
            $sy = rand(0, $rows - 1);
            $tx = rand(0, $columns - 1);
            $ty = rand(0, $rows - 1);
        } while ((($sx === $tx) && ($sy === $ty)) || ($map[$sy][$sx] !== -1) || ($map[$ty][$tx] !== -1));
        
        $map[$sy][$sx] = $i;
        $map[$ty][$tx] = $i + 1;
        if (checkDivision()) {
            $i += 2;
            continue;
        }
        $map[$sy][$sx] = -1;
        $map[$ty][$tx] = -1;
    }
}

function checkDivision() {
    global $visited, $rows, $columns;
    for ($i = 0; $i < $rows; $i++) {
        for ($j = 0; $j < $columns; $j++) {
            $visited[$i][$j] = false;
        }
    }
    
    for ($i = 0; $i < $rows; $i++) {
        for ($j = 0; $j < $columns; $j++) {
            if (!$visited[$i][$j]) {
                if ((countConnected($i, $j) % 2) === 1) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

function countConnected($y, $x) {
    global $visited, $map, $rows, $columns;
    $count = 1;
    
    if ($x < 0 || $x >= $columns) {
        return 0;
    } elseif ($y < 0 || $y >= $rows) {
        return 0;
    } elseif ($visited[$y][$x]) {
        return 0;
    } elseif ($map[$y][$x] !== -1) {
        return 0;
    }
    
    $visited[$y][$x] = true;
    for ($i = 0; $i < 4; $i++) {
        switch ($i) {
            case 0:
                $count += countConnected($y - 1, $x);
                break;
            case 1:
                $count += countConnected($y + 1, $x);
                break;
            case 2:
                $count += countConnected($y, $x - 1);
                break;
            case 3:
                $count += countConnected($y, $x + 1);
        }
    }
    return $count;
}

?>
