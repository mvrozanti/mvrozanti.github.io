#!/bin/bash
find public -type f -exec perl -i -p0e 's/<p class="powered-by">.*?<\/p>//s' {} \;
