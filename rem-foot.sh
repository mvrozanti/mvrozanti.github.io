#!/bin/bash   
perl -i -p0e 's/<p class="powered-by".*?p>//s' public/*
