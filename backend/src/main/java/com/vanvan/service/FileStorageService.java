package com.vanvan.service;

import com.vanvan.exception.EmptyFileException;
import com.vanvan.exception.FileStorageException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    public String storeFile(MultipartFile file, String subDirectory) throws IOException {
        if (file.isEmpty()) {
            throw new EmptyFileException();
        }

        try {
            // Criar diretório se não existir
            Path uploadPath = Paths.get(uploadDir, subDirectory);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Gerar nome único para o arquivo
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID() + fileExtension;

            // Salvar arquivo
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return subDirectory + "/" + uniqueFilename;
        } catch (IOException e) {
            throw new FileStorageException("Erro ao armazenar o arquivo: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String filePath) {
        try {
            Path path = Paths.get(uploadDir, filePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            // Log error but don't fail
            logger.error("Erro ao apagar arquivo: {}", filePath, e);
        }
    }

    public byte[] loadFile(String filePath) throws IOException {
        try {
            Path path = Paths.get(uploadDir, filePath);
            if (!Files.exists(path)) {
                throw new FileStorageException("Arquivo não encontrado: " + filePath);
            }
            return Files.readAllBytes(path);
        } catch (IOException e) {
            throw new FileStorageException("Erro ao carregar o arquivo: " + e.getMessage(), e);
        }
    }
}

