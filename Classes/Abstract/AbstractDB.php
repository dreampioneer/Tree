<?php

namespace App\Classes\Abstract;

use mysqli;
use Exception;
use mysqli_result;
use mysqli_stmt;

abstract class AbstractDB
{
    protected $conn;

    public function __construct(
        string $host,
        string $user,
        string $pass,
        string $db_name
    ) {

        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
        $this->conn = new mysqli($host, $user, $pass);
        if ($this->conn->connect_error) {
            $this->error("Connection Error: " . $this->conn->connect_error);
        }

        $this->createDB($db_name);
        $this->conn->set_charset('utf8');
    }

    /**
     * Cerate DB if doesn't not exist
     * @return mysqli_result
     */
    private function createDB(
        string $db_name
    ): void {
        self::query('CREATE DATABASE IF NOT EXISTS ' . $db_name);
        $this->conn->select_db($db_name);
    }

    /**
     * Handle Error
     * @param string $message
     * @return void
     */
    protected function error(
        string $message
    ): void {
        new Exception("SQL Error! " . $message);
        die;
    }

    /**
     * Get Rows
     * @param string $query
     * @return mysqli_result
     */
    protected function query(
        string $query
    ): mysqli_result|bool {
        $response = $this->conn->query($query);
        if (!$response) {
            $this->error($this->conn->error);
        }
        return $response;
    }

    /**
     * Create, Update and Delete Row
     * @param string $query
     * @return mysqli_stmt
     */
    protected function request(
        string $query
    ): mysqli_stmt {
        $response = $this->conn->prepare($query);
        if (!$response) {
            $this->error($this->conn->error);
        }
        return $response;
    }

    abstract protected function create(string $title, int $parent_id = 0): void;
    abstract protected function read(): mysqli_result;
    abstract protected function update(int $id, string $title): void;
    abstract protected function delete(int $id): void;
}
