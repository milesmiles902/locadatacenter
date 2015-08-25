<?
if (file_exists('./index.html')) {
  rename('./index.php', './a2-default-index.php');
  header('refresh:1');
}

$ch = curl_init('https://www.a2hosting.com/ad-default-page');
curl_exec($ch); curl_close($ch);
?>
