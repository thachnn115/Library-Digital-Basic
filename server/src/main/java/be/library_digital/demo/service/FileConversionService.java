package be.library_digital.demo.service;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.geom.Rectangle2D;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Stream;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.docx4j.Docx4J;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j(topic = "FILE-CONVERSION-SERVICE")
public class FileConversionService {

    @Value("${file.upload-dir:uploads/library-resources}")
    private String uploadDir;

    private static final String CACHE_DIR_NAME = "converted_cache";
    private static final long CACHE_EXPIRY_MINUTES = 60;

    /**
     * Get a PDF version of the file.
     * Use cached version if available and fresh.
     * Otherwise convert and cache.
     */
    public Path getConvertedPdf(Path originalFile) throws IOException {
        String filename = originalFile.getFileName().toString();
        String filenameNoExt = filename.contains(".")
                ? filename.substring(0, filename.lastIndexOf('.'))
                : filename;
        String pdfFilename = filenameNoExt + ".pdf";

        Path cacheDir = Paths.get(uploadDir, CACHE_DIR_NAME).toAbsolutePath().normalize();
        if (!Files.exists(cacheDir)) {
            Files.createDirectories(cacheDir);
        }

        Path cachedPdf = cacheDir.resolve(pdfFilename);

        // Check if cache exists first
        if (Files.exists(cachedPdf)) {
            // Touch the file to update last modified time so it doesn't get cleaned up soon
            Files.setLastModifiedTime(cachedPdf, java.nio.file.attribute.FileTime.from(Instant.now()));
            return cachedPdf;
        }

        log.info("Converting file {} to PDF...", filename);
        try {
            String lowercaseFilename = filename.toLowerCase();
            if (lowercaseFilename.endsWith(".docx")) {
                convertDocxToPdf(originalFile, cachedPdf);
            } else if (lowercaseFilename.endsWith(".pptx")) {
                convertPptxToPdf(originalFile, cachedPdf);
            } else {
                throw new UnsupportedOperationException("Conversion for this file type is not supported: " + filename);
            }
            log.info("Conversion successful: {}", cachedPdf);
            return cachedPdf;
        } catch (Exception e) {
            log.error("Failed to convert file {}", filename, e);
            throw new IOException("Failed to convert file to PDF", e);
        }
    }

    private void convertDocxToPdf(Path source, Path target) throws Exception {
        try (FileInputStream is = new FileInputStream(source.toFile())) {
            WordprocessingMLPackage wordMLPackage = WordprocessingMLPackage.load(is);
            try (FileOutputStream os = new FileOutputStream(target.toFile())) {
                Docx4J.toPDF(wordMLPackage, os);
            }
        }
    }

    private void convertPptxToPdf(Path source, Path target) throws Exception {
        try (XMLSlideShow ppt = new XMLSlideShow(new FileInputStream(source.toFile()));
                PDDocument doc = new PDDocument()) {

            Dimension pgsize = ppt.getPageSize();
            float width = (float) pgsize.getWidth();
            float height = (float) pgsize.getHeight();

            for (XSLFSlide slide : ppt.getSlides()) {
                BufferedImage img = new BufferedImage((int) width, (int) height, BufferedImage.TYPE_INT_RGB);
                Graphics2D graphics = img.createGraphics();

                // Clear background
                graphics.setPaint(Color.white);
                graphics.fill(new Rectangle2D.Float(0, 0, width, height));

                // Render slide
                slide.draw(graphics);

                // Create PDF page
                PDPage page = new PDPage(new PDRectangle(width, height));
                doc.addPage(page);

                PDImageXObject pdImage = LosslessFactory.createFromImage(doc, img);
                try (PDPageContentStream contentStream = new PDPageContentStream(doc, page)) {
                    contentStream.drawImage(pdImage, 0, 0);
                }

                graphics.dispose();
            }

            doc.save(target.toFile());
        }
    }

    /**
     * Clean up cached files that haven't been accessed in the last 60 minutes.
     * Runs every 30 minutes.
     */
    @Scheduled(fixedRate = 1800000) // 30 mins
    public void cleanupCache() {
        log.info("Starting conversion cache cleanup...");
        try {
            Path cacheDir = Paths.get(uploadDir, CACHE_DIR_NAME);
            if (!Files.exists(cacheDir))
                return;

            Instant expiryThreshold = Instant.now().minus(CACHE_EXPIRY_MINUTES, ChronoUnit.MINUTES);

            try (Stream<Path> files = Files.list(cacheDir)) {
                files.forEach(file -> {
                    try {
                        BasicFileAttributes attrs = Files.readAttributes(file, BasicFileAttributes.class);
                        Instant lastModified = attrs.lastModifiedTime().toInstant();

                        if (lastModified.isBefore(expiryThreshold)) {
                            Files.delete(file);
                            log.debug("Deleted expired cache file: {}", file.getFileName());
                        }
                    } catch (IOException e) {
                        log.warn("Failed to process cleanup for file: {}", file, e);
                    }
                });
            }
        } catch (IOException e) {
            log.error("Error during cache cleanup", e);
        }
    }
}
