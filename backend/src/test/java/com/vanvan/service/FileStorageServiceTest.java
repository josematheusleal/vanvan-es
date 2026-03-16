package com.vanvan.service;

import com.vanvan.exception.EmptyFileException;
import com.vanvan.exception.FileStorageException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FileStorageServiceTest {

    private FileStorageService fileStorageService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        fileStorageService = new FileStorageService();
        ReflectionTestUtils.setField(fileStorageService, "uploadDir", tempDir.toString());
    }

    // --- storeFile ---

    @Test
    void storeFile_deveRetornarCaminhoQuandoArquivoValido() throws IOException {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getOriginalFilename()).thenReturn("documento.pdf");
        when(file.getInputStream()).thenReturn(new ByteArrayInputStream("conteudo".getBytes()));

        String result = fileStorageService.storeFile(file, "documentos");

        assertTrue(result.startsWith("documentos/"));
        assertTrue(result.endsWith(".pdf"));
    }

    @Test
    void storeFile_deveCriarSubdiretorioSeNaoExistir() throws IOException {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getOriginalFilename()).thenReturn("foto.jpg");
        when(file.getInputStream()).thenReturn(new ByteArrayInputStream("img".getBytes()));

        fileStorageService.storeFile(file, "fotos/novos");

        assertTrue(Files.exists(tempDir.resolve("fotos/novos")));
    }

    @Test
    void storeFile_deveLancarEmptyFileExceptionQuandoArquivoVazio() {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(true);

        assertThrows(EmptyFileException.class,
                () -> fileStorageService.storeFile(file, "qualquer"));
    }

    @Test
    void storeFile_deveGerarNomeSemExtensaoQuandoArquivoSemExtensao() throws IOException {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getOriginalFilename()).thenReturn("arquivo-sem-extensao");
        when(file.getInputStream()).thenReturn(new ByteArrayInputStream("dados".getBytes()));

        String result = fileStorageService.storeFile(file, "docs");

        assertTrue(result.startsWith("docs/"));
        // sem ponto no nome gerado após o prefixo do diretório
        String filename = result.replace("docs/", "");
        assertFalse(filename.contains("."));
    }

    @Test
    void storeFile_deveGerarNomeSemExtensaoQuandoFilenameNulo() throws IOException {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getOriginalFilename()).thenReturn(null);
        when(file.getInputStream()).thenReturn(new ByteArrayInputStream("dados".getBytes()));

        String result = fileStorageService.storeFile(file, "docs");

        assertTrue(result.startsWith("docs/"));
    }

    @Test
    void storeFile_deveLancarFileStorageExceptionQuandoIOFalha() throws IOException {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getOriginalFilename()).thenReturn("arquivo.pdf");
        when(file.getInputStream()).thenThrow(new IOException("disco cheio"));

        assertThrows(FileStorageException.class,
                () -> fileStorageService.storeFile(file, "docs"));
    }

    // --- loadFile ---

    @Test
    void loadFile_deveRetornarBytesQuandoArquivoExiste() throws IOException {
        Path subDir = tempDir.resolve("docs");
        Files.createDirectories(subDir);
        Path arquivo = subDir.resolve("teste.txt");
        Files.write(arquivo, "conteudo teste".getBytes());

        byte[] result = fileStorageService.loadFile("docs/teste.txt");

        assertArrayEquals("conteudo teste".getBytes(), result);
    }

    @Test
    void loadFile_deveLancarFileStorageExceptionQuandoArquivoNaoExiste() {
        assertThrows(FileStorageException.class,
                () -> fileStorageService.loadFile("nao-existe/arquivo.pdf"));
    }

    // --- deleteFile ---

    @Test
    void deleteFile_deveApagarArquivoExistente() throws IOException {
        Path subDir = tempDir.resolve("docs");
        Files.createDirectories(subDir);
        Path arquivo = subDir.resolve("apagar.txt");
        Files.write(arquivo, "deletar".getBytes());

        fileStorageService.deleteFile("docs/apagar.txt");

        assertFalse(Files.exists(arquivo));
    }

    @Test
    void deleteFile_naoDeveLancarExcecaoSeArquivoNaoExiste() {
        // deleteFile engole o erro — só loga. Não deve lançar nada.
        assertDoesNotThrow(() -> fileStorageService.deleteFile("nao-existe/arquivo.txt"));
    }
}