"""
Image classes
"""

import data
import logging
from galaxy.datatypes.metadata import MetadataElement
from galaxy.datatypes import metadata
from galaxy import util

log = logging.getLogger(__name__)

class Sequence( data.Text ):
    """Class describing a sequence"""
    
    MetadataElement( name="dbkey", desc="Database/Build", default="?",
                     param=metadata.SelectParameter, multiple=False, values=util.dbnames )

class Fasta( Sequence ):
    """Class representing a FASTA sequence"""

    """Add metadata elements"""
    MetadataElement( name="dbkey", desc="Database/Build", default="?",
                     param=metadata.SelectParameter, multiple=False, values=util.dbnames )

    def set_peek( self, dataset ):
        Sequence.set_peek( self, dataset )
        count = size = 0
        for line in file( dataset.file_name ):
            if line and line[0] == ">":
                count += 1
            else:
                line = line.strip()
                size += len(line)
        if count == 1:
            dataset.blurb = '%d bases' % size
        else:
            dataset.blurb = '%d sequences' % count

class Maf( Sequence ):
    """Class describing a Maf alignment"""

    """Add metadata elements"""
    MetadataElement( name="dbkey", desc="Database/Build", default="?",
                     param=metadata.SelectParameter, multiple=True, values=util.dbnames )

class Axt( Sequence ):
    """Class describing an axt alignment"""

    """Add metadata elements"""
    MetadataElement( name="dbkey", desc="Database/Build", default="?",
                     param=metadata.SelectParameter, multiple=False, values=util.dbnames )
    
class Lav( Sequence ):
    """Class describing a LAV alignment"""

    """Add metadata elements"""
    MetadataElement( name="dbkey", desc="Database/Build", default="?",
                     param=metadata.SelectParameter, multiple=False, values=util.dbnames )
