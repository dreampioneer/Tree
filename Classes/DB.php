<?php

namespace App\Classes;

use App\Classes\Abstract\AbstractDB;
use mysqli_result;

class DB extends AbstractDB
{
    const host = 'localhost';
    const user = 'root';
    const pass = '';
    const db_name = 'tree';
    const table_name = 'branch';

    public function __construct()
    {
        parent::__construct(
            self::host,
            self::user,
            self::pass,
            self::db_name
        );

        $this->createTable();
    }

    /**
     * Create a table if it does not exist
     * @return mysqli_result
     */
    private function createTable(): mysqli_result|bool
    {
        $sql = "CREATE TABLE IF NOT EXISTS `" . self::table_name . "` (
                id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                parent_id INT(6) DEFAULT 0,
                title VARCHAR(50) NOT NULL
            )";
        return $this->query($sql);
    }

    /**
     * Create a row
     * @param string $title
     * @param integer $parent_id
     * @return void
     */
    public function create(
        string $title,
        int $parent_id = 0
    ): void {
        $response = $this->request("INSERT INTO `" . self::table_name . "` (title, parent_id) VALUES(?, ?)");
        $response->bind_param('si', $title, $parent_id);
        $response->execute();
        $response->close();
    }

    /**
     * Get rows
     * @return array
     */
    public function read(): mysqli_result
    {
        return $this->query("SELECT * FROM `" . self::table_name . "` ORDER BY parent_id, id");
    }

    /**
     * Update a row
     * @param integer $id
     * @param string $title
     * @return void
     */
    public function update(
        int $id,
        string $title
    ): void {
        $response = self::request("UPDATE `" . self::table_name . "` SET title=? WHERE id=?");
        $response->bind_param('si', $title, $id);
        $response->execute();
        $response->close();
    }

    /**
     * Delete a row
     * @param integer $id
     * @return void
     */
    public function delete(int $id): void {
        $row = self::query("SELECT * FROM `" . self::table_name . "` WHERE id=" . $id);
        
        // Check if it's the root, if so then truncate the entire table
        if ($row->fetch_assoc()['parent_id'] == 0) {
            self::query("TRUNCATE TABLE `" . self::table_name . "`");
        }
        // If not root, perform a recursive deletion of the tree
        else {
            self::query('DELETE FROM ' . self::table_name . ' WHERE id IN (
                WITH RECURSIVE tree AS (
                    SELECT id
                    FROM ' . self::table_name . '
                    WHERE id = ' . $id . '
                    UNION ALL
                    SELECT t.id
                    FROM ' . self::table_name . ' t
                    JOIN tree ON t.parent_id = tree.id
                )
                SELECT id FROM tree
            );');
        }
    }
}
